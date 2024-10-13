import React, { useState, useEffect, useRef } from 'react';
import { createSession } from '../utils/api';
import CodeEditor from './CodeEditor';
import { io } from 'socket.io-client';

// Define the interface for props
interface SessionManagerProps {
    onSessionCreated: (newSessionId: string) => void;
    onSessionJoined: (joinedSessionId: string, code: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onSessionCreated, onSessionJoined }) => {
    const [creatorId, setCreatorId] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const socketRef = useRef<any>(null);

    useEffect(() => {
        if (sessionId) {
            // Establish WebSocket connection
            const socket = io('http://localhost:4000'); // Replace with production WebSocket URL
            socketRef.current = socket;

            // Join the session room
            socket.emit('joinSession', sessionId);

            // Notify parent component that the session has been joined
            onSessionJoined(sessionId, code);

            // Listen for real-time code updates
            socket.on('codeChange', (updatedCode: string) => {
                setCode(updatedCode);
            });

            // Cleanup on unmount
            return () => {
                socket.disconnect();
            };
        }
    }, [sessionId, onSessionJoined]);

    const handleCreateSession = async () => {
        try {
            const newSession = await createSession({ creatorId, code: '' });
            setSessionId(newSession.id);
            // Notify parent component that a new session has been created
            onSessionCreated(newSession.id);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        // Emit the code change to other users
        if (socketRef.current && sessionId) {
            socketRef.current.emit('codeChange', { sessionId, code: newCode });
        }
    };

    return (
        <div>
            <h1>Create a New Session</h1>
            <input
                type="text"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                placeholder="Enter your user ID"
            />
            <button onClick={handleCreateSession}>Create Session</button>
            <CodeEditor code={code} onCodeChange={handleCodeChange} />
        </div>
    );
};

export default SessionManager;
