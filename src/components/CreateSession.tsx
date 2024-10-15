import React from 'react';
import axios from 'axios';

interface CreateSessionProps {
    onSessionCreated: (id: string, userRole: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onSessionCreated }) => {
    // No need for creatorId state since it's hardcoded
    const creatorId = 'Creator'; // Hardcoded creator ID

    const handleCreateSession = async () => {
        try {
            const initialCode = '// Hello World'; // Default code
            const response = await axios.post('http://localhost:4000/api/sessions', {
                creatorId,
                code: initialCode,
            });
            onSessionCreated(response.data.id, 'creator'); // Notify parent of session creation with user role
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Create a New Session</h2>
            {/* Remove the input field */}
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
