from sqlalchemy import Column, Integer, String
from database import Base

class PDFFile(Base):
    __tablename__ = "pdf_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    s3_url = Column(String)