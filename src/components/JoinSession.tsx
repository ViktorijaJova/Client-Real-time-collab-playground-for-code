import React, { useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

interface JoinSessionProps {
    onSessionJoined: (id: string, initialCode: string, userRole: string) => void;
}

const socket = io("http://localhost:4000"); // Ensure the socket connection is established

const JoinSession: React.FC<JoinSessionProps> = ({ onSessionJoined }) => {
    const [sessionUrl, setSessionUrl] = useState(''); // Full session URL input
    const [userName, setUserName] = useState(''); // Name input

    const handleJoinSession = async () => {
        try {
            const urlParts = sessionUrl.split('/');
            const id = urlParts[urlParts.length - 1]; // Get the last part of the URL as the session ID

            // Fetch the initial code for the session
            const response = await axios.get(`http://localhost:4000/api/sessions/${id}`);
            const initialCode = response.data.code; // Assuming the API returns the code
            onSessionJoined(response.data.id, initialCode, 'participant'); // Notify parent with session data and role
            
            // Emit the joinSession event to the socket
            socket.emit('joinSession', id, userName); // Send userName as well
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
                placeholder="Enter session URL"
                value={sessionUrl}
                onChange={(e) => setSessionUrl(e.target.value)}
            />
            <button onClick={handleJoinSession}>Join Session</button>
        </div>
    );
};

export default JoinSession;
