import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSession, updateSessionCode } from '../utils/api';
import CodeEditor from './CodeEditor';
import { io } from 'socket.io-client'; // Import io from socket.io-client

const JoinSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const socket = io('http://localhost:4000 || "https://obscure-retreat-63973-92abc2c62e6e.herokuapp.com/"'); // Ensure to import io from socket.io-client

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

        // Listen for code changes
        socket.on('codeChange', (updatedCode: string) => { // Define the type for updatedCode
            setCode(updatedCode);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect(); // Disconnect socket on unmount
        };
    }, [sessionId]);

    const handleCodeChange = async (newCode: string) => {
        setCode(newCode);

        if (sessionId) {
            try {
                await updateSessionCode(sessionId, newCode);
            } catch (error) {
                console.error('Error updating session code:');
                setError('Failed to update code in session.');
            }
        } else {
            console.error('Session ID is undefined. Cannot update session code.');
            setError('Unable to update code because the session ID is undefined.');
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
