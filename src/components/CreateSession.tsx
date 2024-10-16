import React from "react";
import axios from "axios";

interface CreateSessionProps {
  onSessionCreated: (id: string, userRole: string, initialCode: string) => void; // Updated to include initial code
}

const CreateSession: React.FC<CreateSessionProps> = ({ onSessionCreated }) => {
  const creatorId = "creator";

  const handleCreateSession = async () => {
    try {
      const initialCode = "// Hello World"; // Default code
      const response = await axios.post("https://obscure-retreat-63973-92abc2c62e6e.herokuapp.com/api/sessions", // for production
       //  const response = await axios.post("http://localhost:4000/api/sessions", // for local testing
        {
          creatorId,
          code: initialCode,
        }
      );
      onSessionCreated(response.data.id, "creator", initialCode); // Pass initial code here
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-blue-400 mb-4">
        Create a New Session
      </h2>
      <button
        onClick={handleCreateSession}
        className="bg-blue-300 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-400 transition duration-300"
      >
        Create Session
      </button>
    </div>
  );
};

export default CreateSession;
