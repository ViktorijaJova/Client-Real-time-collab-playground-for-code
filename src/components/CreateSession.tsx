// CreateSession.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface CreateSessionProps {
    onSessionCreated: (id: string, userRole: string) => void; // Update the prop type to include userRole
}

const CreateSession: React.FC<CreateSessionProps> = ({ onSessionCreated }) => {
    const [creatorId, setCreatorId] = useState(''); // Name input

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
        <div>
            <h2>Create a New Session</h2>
            <input
                type="text"
                placeholder="Enter your name"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
            />
            <button onClick={handleCreateSession}>Create Session</button>
        </div>
    );
};

export default CreateSession;
