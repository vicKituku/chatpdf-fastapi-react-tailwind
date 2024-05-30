import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropagateLoader from "react-spinners/PropagateLoader";

const FileUploadForm = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handledragOver = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);
        const endpoint = "https://16.16.77.46/upload";
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          console.log("File uploaded successfully");
          const data = await response.json();
          console.log("navigating");
          navigate("/chatpdf", { state: { data } });
        } else {
          console.error("Failed to upload");
        }
      } catch (error) {
        console.error("Error occured during file upload", error);
      } finally {
        setLoading(false);
      }
    }
    handleClearFile();
  };

  return (
    <>
      <div className="w-full bg-white flex items-center justify-center">
        {/* Input div */}
        <div className="w-full h-auto rounded-md bg-white shadow-md border border-slate-200 p-5">
          <form>
            <label
              htmlFor="input"
              className="block text-slate-800 font-medium mb-1.5"
            >
              Upload PDF
            </label>
            <div className="flex items-start w-full justify-center">
              {file ? (
                <div className="text-start my-3 ">
                  <div className="relative inline-block">
                    <div className="w-full h-auto px-3 py-1 bg-gray-200 text-[0.8rem] text-grey-800 rounded-md">
                      <span className="text-black text-base font-medium">
                        File Name: {""}
                      </span>
                      {file.name}
                    </div>
                    <button
                      className="absolute -top-3 -right-2 bg-gray-200 text-red-500 cursor-pointer rounded-sm"
                      onClick={handleClearFile}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-x-lg"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="dragdrop-file"
                  className="flex flex-col items-center border-dashed justify-center w-full h-[17vh] border-2 cursor-pointer bg-gray-50 rounded-md"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      fill="currentColor"
                      className="bi bi-cloud-upload-fill text-gray-500"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0"
                      />
                    </svg>
                    <p className="mb-2 ">
                      <span className="font-medium">Click to Upload</span>
                    </p>
                  </div>
                </label>
              )}
            </div>
            <input
              id="dragdrop-file"
              className="hidden"
              type="file"
              accept="application/pdf"
              onChange={handledragOver}
            />
            <div>
              {loading && (
                <div className="py-4 my-4">
                  <PropagateLoader color="blue" />
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-4"
            >
              Process Pdf
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default FileUploadForm;
