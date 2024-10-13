// src/components/CreateSession.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface CreateSessionProps {
    onSessionCreated: (id: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onSessionCreated }) => {
    const [creatorId, setCreatorId] = useState('');
    const [code, setCode] = useState('');

    const handleCreateSession = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/sessions', {
                creatorId,
                code,
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
            <textarea 
                placeholder="Initial code..." 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
            />
            <button onClick={handleCreateSession}>Create Session</button>
        </div>
    );
};

export default CreateSession;
