// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { io } from 'socket.io-client';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';

// const socket = io('https://obscure-retreat-63973-92abc2c62e6e.herokuapp.com'); // Production URL
const socket = io('http://localhost:4000'); // Local URL

const App: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Listen for code changes from other users
        socket.on('codeChange', (newCode: string) => {
            setCode(newCode);
        });

        return () => {
            socket.off('codeChange');
        };
    }, []);

    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue) {
            setCode(newValue);
            socket.emit('codeChange', newValue); // Emit the code change
        }
    };

    const handleSessionCreated = (id: string) => {
        setSessionId(id);
    };

    const handleSessionJoined = (id: string, initialCode: string) => {
        setSessionId(id);
        setCode(initialCode);
        socket.emit('codeChange', initialCode); // Emit initial code when joining
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
