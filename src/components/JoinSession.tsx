import React, { useState } from 'react';
import axios from 'axios';

interface JoinSessionProps {
    onSessionJoined: (id: string, initialCode: string, userRole: string) => void; // Updated to include userRole
}

const JoinSession: React.FC<JoinSessionProps> = ({ onSessionJoined }) => {
    const [sessionId, setSessionId] = useState('');
    const [userName, setUserName] = useState(''); // Name input

    const handleJoinSession = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/sessions/${sessionId}`);
            const initialCode = response.data.code;
            onSessionJoined(response.data.id, initialCode, 'participant'); // Notify parent with session data and role
        } catch (error) {
            console.error('Error joining session:', error);
        }
    };

    return (
        <div>
            <h2>Join an Existing Session</h2>
            <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
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
