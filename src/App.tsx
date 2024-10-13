// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { io } from 'socket.io-client';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';

const socket = io('http://localhost:4000'); // Local URL

const App: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Listen for code changes from other users
        socket.on('codeChange', (newCode: string) => {
            console.log('Received codeChange:', newCode);
            setCode(newCode);
        });

        return () => {
            socket.off('codeChange');
        };
    }, []);

    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue) {
            setCode(newValue);
            socket.emit('codeChange', { sessionId, code: newValue }); // Emit the code change
        }
    };

    const handleSessionCreated = (id: string) => {
        setSessionId(id);
        socket.emit('joinSession', id); // Join the session upon creation
    };

    const handleSessionJoined = (id: string, initialCode: string) => {
        setSessionId(id);
        setCode(initialCode);
        socket.emit('joinSession', id); // Join the session upon joining
    };

    return (
        <div style={{ height: '100vh' }}>
            {!sessionId ? (
                <>
                    <CreateSession onSessionCreated={handleSessionCreated} />
                    <JoinSession onSessionJoined={handleSessionJoined} />
                </>
            ) : (
                <>
                    <h2>Editing Session: {sessionId}</h2>
                    <Editor
                        height="100%"
                        language="javascript"
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            automaticLayout: true,
                            minimap: { enabled: false },
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default App;
