// src/App.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import CodeEditor from './components/CodeEditor';
import SessionManager from './components/SessionManager'; // Import the SessionManager

const socket = io('http://localhost:4000'); // Update with your server URL

const App: React.FC = () => {
    const [code, setCode] = useState<string>(''); // Default code

    useEffect(() => {
        socket.on('codeChange', (newCode: string) => {
            setCode(newCode);
        });

        return () => {
            socket.off('codeChange');
        };
    }, []);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        socket.emit('codeChange', newCode);
    };

    return (
        <div>
            <h1>Real-Time Collaborative Code Playground </h1>
            
            {/* Render the SessionManager component */}
            <SessionManager />
            
            {/* Optionally render the CodeEditor here or conditionally based on session */}
            <CodeEditor code={code} onCodeChange={handleCodeChange} />
        </div>
    );
};

export default App;
