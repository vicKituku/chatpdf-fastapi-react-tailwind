import React from "react";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div
      className={`p-2.5 my-1.5 rounded-md max-w-[80%] break-words ${
        isUser
          ? "self-end bg-gradient-to-r from-gray-100 to-gray-300"
          : "flex-start bg-gradient-to-r from-violet-400 to-purple-300"
      }`}
    >
      {message}
    </div>
  );
};

export default ChatMessage;
