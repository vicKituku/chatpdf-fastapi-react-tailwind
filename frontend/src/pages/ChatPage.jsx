import React from "react";
import ChatWindow from "../components/ChatWindow";
import { useLocation } from "react-router-dom";
import PdfViewer from "../components/PdfViewer";
import { Link } from "react-router-dom";

const ChatPage = () => {
  const location = useLocation();
  const { data } = location.state;
  return (
    <div className="relative ">
      <div
        className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="relative top-24 overflow-hidden md:px-40">
        <div className="flex justify-center flex-col">
          <h2 className="text-center text-4xl font-bold">{data.filename}</h2>
          <Link to="/" className="self-center mt-4">
            <button className="flex items-center ml-2.5 py-1.5 px-5 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-left-circle"
                viewBox="0 0 16 16"
                className="mr-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"
                />
              </svg>
              Go back
            </button>
          </Link>
        </div>
        <div className="mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 min-h-[800px]">
          {/* Left div - Chat Interface */}
          <div className="flex justify-center w-full">
            <div className="p-4  border-gray-300">
              <ChatWindow namespace={data.namespace} />
            </div>
          </div>

          {/* Right div - PDF Viewer */}
          <div className="flex flex-col">
            <h1 className="text-center font-bold text-3xl mb-3 md:hidden">
              Your Pdf
            </h1>
            <div className="w-full p-4 max-h-[500px] sm:max-h-[750px] ">
              <PdfViewer path={data.s3_url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
