import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import axios from "axios";

const ChatWindow = ({ namespace }) => {
  const [messages, setMessages] = useState([]);
  const chatWindowRef = useRef(null);

  const handleSend = async (message) => {
    const userMessage = { message, isUser: true };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post("https://13.48.6.219/query", {
        query: message,
        namespace: namespace.toString(), // Replace with actual namespace
      });
      const botMessage = {
        message: response.data.response,
        isUser: false,
      };
      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error("Error querying the backend:", error);
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages change

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  return (
    <div className="md:w-[400px] h-[600px] flex flex-col bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
      <div
        className="flex-1 p-2.5 overflow-y-auto flex flex-col "
        ref={chatWindowRef}
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg.message} isUser={msg.isUser} />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
