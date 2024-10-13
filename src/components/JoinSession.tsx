import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSession } from '../utils/api';
import CodeEditor from './CodeEditor';
import { io } from 'socket.io-client';

const JoinSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const socketRef = useRef<any>(null);

    useEffect(() => {
        // Establish WebSocket connection
        const socket = io('http://localhost:4000'); // Or your production WebSocket URL
        socketRef.current = socket;

        // Join the session room
        if (sessionId) {
            socket.emit('joinSession', sessionId);
        }

        // Listen for real-time code updates
        socket.on('codeChange', (updatedCode: string) => {
            setCode(updatedCode);
        });

        // Fetch the initial session code when joining
        const fetchSession = async () => {
            try {
                if (sessionId) {
                    const session = await getSession(sessionId);
                    setCode(session.code);
                }
            } catch (error) {
                console.error('Error fetching session:', error);
                setError('Failed to join session.');
            }
        };
        fetchSession();

        // Cleanup WebSocket on component unmount
        return () => {
            socket.disconnect();
        };
    }, [sessionId]);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        // Emit the code change to other users
        if (socketRef.current) {
            socketRef.current.emit('codeChange', { sessionId, code: newCode });
        }
    };

    return (
        <div>
            <h1>Join Session</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <CodeEditor code={code} onCodeChange={handleCodeChange} />
        </div>
    );
};

export default JoinSession;
