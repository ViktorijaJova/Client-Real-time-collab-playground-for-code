import React, { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

interface JoinSessionProps {
  onSessionJoined: (id: string, initialCode: string, userRole: string) => void;
}

const socket = io("http://localhost:4000"); // Ensure the socket connection is established

const JoinSession: React.FC<JoinSessionProps> = ({ onSessionJoined }) => {
  const [sessionUrl, setSessionUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isValidUrl = (url: string) => {
    const urlPattern = /^https?:\/\/[\w.-]+(:\d+)?\/session\/\w+$/;
    return urlPattern.test(url);
  };

  const handleJoinSession = async () => {
    setErrorMessage("");

    if (!userName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!isValidUrl(sessionUrl)) {
      setErrorMessage("Please enter a valid session URL.");
      return;
    }

    try {
      const urlParts = sessionUrl.split("/");
      const id = urlParts[urlParts.length - 1];
      const response = await axios.get(
        `http://localhost:4000/api/sessions/${id}`
      );
      const initialCode = response.data.code;
      onSessionJoined(response.data.id, initialCode, userName);
      socket.emit("joinSession", id, userName);
    } catch (error) {
      console.error("Error joining session:", error);
      setErrorMessage(
        "Error joining session. Please check the URL and try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto mt-6">
      <h2 className="text-xl font-semibold text-blue-400 mb-4">
        Join an Existing Session
      </h2>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full p-2 mb-4 border text-pink-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <input
        type="text"
        placeholder="Enter session URL"
        value={sessionUrl}
        onChange={(e) => setSessionUrl(e.target.value)}
        className="w-full p-2 mb-4 border text-pink-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={handleJoinSession}
        className="bg-blue-300 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-400 transition duration-300"
      >
        Join Session
      </button>
    </div>
  );
};

export default JoinSession;
