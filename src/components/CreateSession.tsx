import React, { useState } from 'react';
import axios from 'axios';

interface CreateSessionProps {
    onSessionCreated: (id: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onSessionCreated }) => {
    const [creatorId, setCreatorId] = useState('');

    const handleCreateSession = async () => {
        try {
            // Set initial code to "// Hello World"
            const initialCode = '// Hello World';
            const response = await axios.post('http://localhost:4000/api/sessions', {
                creatorId,
                code: initialCode, // Use the hardcoded initial code
            });
            console.log('Session created:', response.data);
            onSessionCreated(response.data.id); // Call the parent function to update the session ID
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    return (
        <div>
            <h2>Create a New Session</h2>
            <input 
                type="text" 
                placeholder="Your ID" 
                value={creatorId} 
                onChange={(e) => setCreatorId(e.target.value)} 
            />
            <button onClick={handleCreateSession}>Create Session</button>
        </div>
    );
};

export default CreateSession;
