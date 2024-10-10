import React, { useState } from 'react';
import SessionManager from './components/SessionManager';
import CodeEditor from './components/CodeEditor';

const App: React.FC = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [code, setCode] = useState('');

    const handleSessionCreated = (newSessionId: string) => {
        setSessionId(newSessionId);
    };

    const handleSessionJoined = (joinedSessionId: string, code: string) => {
        setSessionId(joinedSessionId);
        setCode(code);
    };

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
    };

    return (
        <div>
            {/* Render the SessionManager component */}
            <SessionManager 
                onSessionCreated={handleSessionCreated} 
                onSessionJoined={handleSessionJoined} // Pass join handler
            />

            {/* Only show the CodeEditor if a session has been joined or created */}
            {sessionId && <CodeEditor code={code} onCodeChange={handleCodeChange} />}
        </div>
    );
};

export default App;
