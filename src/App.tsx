import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { io } from 'socket.io-client';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';

const socket = io('http://localhost:4000'); // Local URL

const App: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null); // Store user role
    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('codeChange', (newCode: string) => {
            setCode(newCode);
        });

        socket.on('codeOutput', (newOutput: string) => {
            if (newOutput.startsWith('Error:')) {
                setError(newOutput);
                setOutput(null);
            } else {
                setOutput(newOutput);
                setError(null);
            }
        });

        return () => {
            socket.off('codeChange');
            socket.off('codeOutput');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue) {
            setCode(newValue);
            socket.emit('codeChange', { sessionId, code: newValue });
        }
    };

    const handleSessionCreated = (id: string, userRole: string) => {
        setSessionId(id);
        setRole(userRole); // Set the role when a session is created
        socket.emit('joinSession', id);
    };

    const handleSessionJoined = (id: string, initialCode: string, userRole: string) => {
        setSessionId(id);
        setCode(initialCode);
        setRole(userRole); // Set the role when a session is joined
        socket.emit('joinSession', id);
    };

    const runCode = () => {
        if (sessionId && code) {
            socket.emit('runCode', sessionId, code);
        }
    };

    return (
        <div style={{ height: '100vh' }}>
            {!sessionId ? (
                <>
                    <h1>Welcome to My Playground</h1>
                    <CreateSession onSessionCreated={handleSessionCreated} />
                    <JoinSession onSessionJoined={handleSessionJoined} />
                </>
            ) : (
                <>
                    <h2>Editing Session: {sessionId} (Role: {role})</h2>
                    <Editor
                        height="80%"
                        language="javascript"
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            automaticLayout: true,
                            minimap: { enabled: false },
                        }}
                    />
                    <button style={{ marginTop: '20px', background: 'red', padding: '10px' }} onClick={runCode}>Run Code</button>
                    {output && (
                        <div style={{ marginTop: '20px', background: 'red', padding: '10px' }}>
                            <h3 style={{ marginTop: '20px' }}>Output:</h3>
                            <pre>{output}</pre>
                        </div>
                    )}
                    {error && (
                        <div style={{ marginTop: '20px', background: 'yellow', padding: '10px', color: 'black' }}>
                            <h3 style={{ marginTop: '20px' }}>Error:</h3>
                            <pre>{error}</pre>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default App;
