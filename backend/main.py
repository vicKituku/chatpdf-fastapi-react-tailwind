import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
from database import engine, SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import aiofiles
import models
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_db():
    async with SessionLocal() as session:
        yield session


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


S3_BUCKET = os.environ["S3_BUCKET"]
S3_REGION = os.environ["S3_REGION"]
s3_client = boto3.client(
    "s3",
    region_name=S3_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# Creating and initializing pinecone index
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index_name = "chatpdf"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

index = pc.Index(index_name)


# OpenAI setup
client = OpenAI()

namespace = ""


@app.post("/upload")
async def upload_files(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    try:
        # Save the file locally
        async with aiofiles.open(file.filename, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)
        s3_key = file.filename

        # Upload the file to S3
        try:
            s3_client.upload_file(file.filename, S3_BUCKET, s3_key)
        except (NoCredentialsError, ClientError) as e:
            raise HTTPException(status_code=500, detail="Could not upload file")
        finally:
            out_file.close()
        os.remove(file.filename)
        s3_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"

        # Save the file information to the database
        pdf_file = models.PDFFile(filename=file.filename, s3_url=s3_url)
        db.add(pdf_file)
        await db.commit()
        await db.refresh(pdf_file)

        # Download the PDF from S3
        s3_client.download_file(S3_BUCKET, s3_key, file.filename)

        # Load PDF using LangChain's PyMuPDFLoader
        loader = PyMuPDFLoader(file.filename)
        documents = loader.load()

        # Split text using CharacterTextSplitter
        splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(documents[0].page_content)

        # Generate embeddings and upsert to Pinecone
        for i, chunk in enumerate(chunks):
            response = client.embeddings.create(
                input=chunk, model="text-embedding-ada-002"
            )
            embedding = response.data[0].embedding
            metadata = {"filename": file.filename, "chunk_index": i, "chunk": chunk}
            index.upsert(
                [(f"{pdf_file.id}-{i}", embedding, metadata)],
                namespace=str(pdf_file.id),
            )
        namespace = pdf_file.id
        print(f"Using namespace: {namespace}")
        return JSONResponse(content={"filename": file.filename, "s3_url": s3_url, "namespace": pdf_file.id})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class QueryRequest(BaseModel):
    query: str
    namespace: str


@app.post("/query")
async def query_index(request: QueryRequest):  # Set namespace default to None
    try:
        query = request.query
        namespace = request.namespace
        if namespace is None:
            raise HTTPException(status_code=400, detail="Namespace not provided")

        query_response = client.embeddings.create(
            input=query, model="text-embedding-ada-002"
        )
        embedding = query_response.data[0].embedding
        results = index.query(
            namespace=namespace, vector=embedding, top_k=3, include_metadata=True
        )
        if not results.matches:
            raise HTTPException(status_code=404, detail="No results found in index")

        # Build a prompt using the original query and the Pinecone data
        results_from_search = ""
        try:
            for result in results.matches:
                source = result.metadata["chunk"]
                results_from_search += source + "\n"
        except Exception as e:
            print("Error in looping reulst", e)
            # Perform any additional processing to include Pinecone data in the prompt

        # Get a chat completion response from OpenAI
        updated_query = f"""Use the below provided information to answer the subsequent question. If the answer cannot be found, write "I don't know."

        provided information:
        \"\"\"
        {results_from_search}
        \"\"\"

        Question: {query}"""
        response = (
            client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You answer questions based on context",
                    },
                    {"role": "user", "content": updated_query},
                ],
            )
            .choices[0]
            .message.content
        )
        return {"query": query, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
