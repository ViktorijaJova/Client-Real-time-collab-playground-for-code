import React, { useState } from 'react';
import { createSession } from '../utils/api';

const SessionManager: React.FC = () => {
    const [creatorId, setCreatorId] = useState(''); // Can accept any input
    const [session, setSession] = useState<any>(null);
    const [error, setError] = useState('');

    const handleCreateSession = async () => {
        try {
            setError(''); // Clear any previous error messages
            const newSession = await createSession(creatorId);
            setSession(newSession); // Store the session data
            console.log('Session created:', newSession);
        } catch (error) {
            console.error('Error creating session:', error);
            setError('Failed to create session. Please try again.');
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

            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
            
            {session && (
                <div>
                    <h2>Session Created!</h2>
                    <p>Session ID: {session.id}</p>
                    <p>Creator ID: {session.creator_id}</p>
                    {/* Add a link or button to join the session */}
                </div>
            )}
        </div>
    );
};

export default SessionManager;
