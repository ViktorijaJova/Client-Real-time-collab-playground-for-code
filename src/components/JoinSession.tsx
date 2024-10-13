// src/components/JoinSession.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface JoinSessionProps {
    onSessionJoined: (id: string, initialCode: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ onSessionJoined }) => {
    const [sessionId, setSessionId] = useState('');

    const handleJoinSession = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/sessions/${sessionId}`);
            console.log('Session data:', response.data);
            onSessionJoined(response.data.id, response.data.code); // Call parent function with session data
        } catch (error) {
            console.error('Error joining session:', error);
        }
    };

    return (
        <div>
            <h2>Join an Existing Session</h2>
            <input 
                type="text" 
                placeholder="Session ID" 
                value={sessionId} 
                onChange={(e) => setSessionId(e.target.value)} 
            />
            <button onClick={handleJoinSession}>Join Session</button>
        </div>
    );
};

export default JoinSession;
