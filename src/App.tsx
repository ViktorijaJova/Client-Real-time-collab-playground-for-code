import React, { useEffect, useState, useRef } from 'react';
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
    const [sessionLink, setSessionLink] = useState<string>(''); // State to hold the session link
    const [isLocked, setIsLocked] = useState(false);
    const [lockStatusMessage, setLockStatusMessage] = useState<string | null>(null); // State for lock status message

    const kickParticipant = (userName: string) => {
        if (sessionId) {
            socket.emit('kickParticipant', sessionId, userName);
        }
    };

    const lockSession = () => {
        if (sessionId) {
            socket.emit('lockSession', sessionId);
        }
    };

    const unlockSession = () => {
        if (sessionId) {
            socket.emit('unlockSession', sessionId);
        }
    };

    // Undo/Redo Stacks
    const undoStack = useRef<string[]>([]);
    const redoStack = useRef<string[]>([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('sessionLocked', () => {
            setIsLocked(true);
            if (role === 'participant') {
                setLockStatusMessage('The session is now locked. You cannot edit the code.');
            }
        });

        socket.on('sessionUnlocked', () => {
            setIsLocked(false);
            if (role === 'participant') {
                setLockStatusMessage('The session is now unlocked. You can edit the code again.');
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('codeChange', (newCode: string) => {
            // On receiving new code from another client, update and push to undoStack
            undoStack.current.push(code);  // Save current code state
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
            socket.off('sessionLocked');
            socket.off('sessionUnlocked');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [code, role]); // Add role as a dependency

    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue) {
            undoStack.current.push(code);  // Save the previous code state before changing
            redoStack.current = [];  // Clear redoStack on new change
            setCode(newValue);
            socket.emit('codeChange', { sessionId, code: newValue });
        }
    };

    const handleUndo = () => {
        if (undoStack.current.length > 0) {
            const previousCode = undoStack.current.pop(); // Remove last change
            redoStack.current.push(code);  // Save current code to redoStack
            if (previousCode !== undefined) {
                setCode(previousCode);
                socket.emit('codeChange', { sessionId, code: previousCode });
            }
        }
    };

    const handleRedo = () => {
        if (redoStack.current.length > 0) {
            const nextCode = redoStack.current.pop(); // Get the last undone change
            undoStack.current.push(code);  // Save current code to undoStack
            if (nextCode !== undefined) {
                setCode(nextCode);
                socket.emit('codeChange', { sessionId, code: nextCode });
            }
        }
    };

    const handleSessionCreated = (id: string, userRole: string) => {
        setSessionId(id);
        setRole(userRole); // Set the role when a session is created
        setSessionLink(`http://localhost:3000/session/${id}`); // Generate the session link
        socket.emit('joinSession', id);
    };

    const handleSessionJoined = (id: string, initialCode: string, userRole: string) => {
        setSessionId(id);
        setCode(initialCode);
        setRole(userRole); // Set the role when a session is joined
        socket.emit('joinSession', id);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(sessionLink); // Copy the link to the clipboard
        alert('Session link copied to clipboard!'); // Notify the user
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
                    {sessionLink && (
                        <div>
                            <p>Share this link to join the session:</p>
                            <input type="text" value={sessionLink} readOnly />
                            <button onClick={handleCopyLink}>Copy Link</button>
                        </div>
                    )}
                    <Editor
                        height="80%"
                        language="javascript"
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            automaticLayout: true,
                            minimap: { enabled: false },
                            readOnly: isLocked // Disable editing if the session is locked
                        }}
                    />
                    {role === 'creator' && (
                        <>
                            <button onClick={() => kickParticipant('participantUserName')}>Kick Participant</button>
                            <button onClick={lockSession}>Lock Session</button>
                            <button onClick={unlockSession}>Unlock Session</button>
                        </>
                    )}
                    {role === 'participant' && lockStatusMessage && ( // Show lock status message for participants
                        <div style={{ marginTop: '20px', background: 'orange', padding: '10px' }}>
                            <h3>{lockStatusMessage}</h3>
                        </div>
                    )}
                    <div style={{ marginTop: '20px' }}>
                        <button style={{ background: 'red', padding: '10px' }} onClick={handleUndo}>Undo</button>
                        <button style={{ marginLeft: '10px', background: 'green', padding: '10px' }} onClick={handleRedo}>Redo</button>
                    </div>
                    {output && (
                        <div style={{ marginTop: '20px', background: 'red', padding: '10px' }}>
                            <h3>Output:</h3>
                            <pre>{output}</pre>
                        </div>
                    )}
                    {error && (
                        <div style={{ marginTop: '20px', background: 'yellow', padding: '10px', color: 'black' }}>
                            <h3>Error:</h3>
                            <pre>{error}</pre>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default App;
