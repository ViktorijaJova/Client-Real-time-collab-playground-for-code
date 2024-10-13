// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react'; // Correct import
import { io } from 'socket.io-client';

// Replace with your Heroku backend URL
const socket = io('https://obscure-retreat-63973-92abc2c62e6e.herokuapp.com'); // Change to your backend URL
//const socket = io('http://localhost:4000'); // Change to your backend URL in production

const App: React.FC = () => {
    const [code, setCode] = useState<string>(''); // State to store the code

    useEffect(() => {
        // Listen for code changes from the server
        socket.on('codeChange', (newCode: string) => {
            console.log('Received code change:', newCode); // Log received code
            setCode(newCode); // Update local state with new code
        });
    
        return () => {
            socket.off('codeChange'); // Clean up the listener on unmount
        };
    }, []);

    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue) {
            setCode(newValue); // Update local code state
            console.log('Emitting code change:', newValue); // Log the emitted code
            socket.emit('codeChange', newValue); // Emit code change to the server
        }
    };

    return (
        <div style={{ height: '100vh' }}>
            <div>Test</div>
            <Editor
                height="100%"
                language="javascript" // Change to your desired language
                value={code}
                onChange={handleCodeChange}
                options={{
                    automaticLayout: true,
                    minimap: { enabled: false }, // Disable minimap for better visibility
                }}
            />
        </div>
    );
};

export default App;
