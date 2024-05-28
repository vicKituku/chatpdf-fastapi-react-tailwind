import React, { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex p-2.5 border-t border-gray-300"
    >
      <input
        className="flex-1 p-2.5 border border-gray-300 rounded-sm"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        type="submit"
        className="ml-2.5 py-2.5 px-5 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
