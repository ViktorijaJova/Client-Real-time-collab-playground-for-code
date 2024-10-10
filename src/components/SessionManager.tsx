import React, { useState } from 'react';
import { createSession, getSession, updateSessionCode } from '../utils/api'; // Import the updateSessionCode function
import CodeEditor from './CodeEditor';

interface SessionManagerProps {
    onSessionCreated: (newSessionId: string) => void;
    onSessionJoined: (sessionId: string, code: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onSessionCreated, onSessionJoined }) => {
    const [creatorId, setCreatorId] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [joinSessionId, setJoinSessionId] = useState<string>(''); 
    const [code, setCode] = useState(''); 
    const [error, setError] = useState('');

    const handleCreateSession = async () => {
        try {
            setError('');
            const newSession = await createSession({ creatorId, code: '' }); // Create with empty code
            setSessionId(newSession.id);
            onSessionCreated(newSession.id);
            console.log('Session created:', newSession);
        } catch (error) {
            console.error('Error creating session:', error);
            setError('Failed to create session. Please try again.');
        }
    };

    const handleJoinSession = async () => {
        try {
            setError('');
            const session = await getSession(joinSessionId);
            if (session) {
                setSessionId(session.id);
                setCode(session.code); // Set the code from the session
                onSessionJoined(session.id, session.code);
                console.log('Session joined:', session);
            }
        } catch (error) {
            console.error('Error joining session:', error);
            setError('Failed to join session. Please check the session ID.');
        }
    };

    // Update the code in the backend whenever it changes
    const handleCodeChange = async (newCode: string) => {
        setCode(newCode);
        if (sessionId) {
            await updateSessionCode(sessionId, newCode); // Call API to update code in session
        }
    };

    return (
        <div>
            <h1>Create a New Session</h1>
            <input
                type="text"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                placeholder="Enter your user ID (any number)"
            />
            <button onClick={handleCreateSession}>Create Session</button>
            
            <h1>Or Join a Session</h1>
            <input
                type="text"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                placeholder="Enter session ID to join"
            />
            <button onClick={handleJoinSession}>Join Session</button>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {sessionId && (
                <div>
                    <h2>Session ID: {sessionId}</h2>
                    <p>Creator ID: {creatorId}</p>
                    <CodeEditor code={code} onCodeChange={handleCodeChange} />
                </div>
            )}
        </div>
    );
};

export default SessionManager;
