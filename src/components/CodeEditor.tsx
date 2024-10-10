// src/components/CodeEditor.tsx
import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    onCodeChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange }) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            // Clear the previous timeout if it's set
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a new timeout to delay the update
            timeoutRef.current = setTimeout(() => {
                onCodeChange(value); // Update the parent state and call the API to update the code in the session
            }, 500); // Adjust delay as needed
        }
    };

    // Cleanup function to clear the timeout when the component unmounts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <MonacoEditor
            height="90vh"
            language="javascript"
            value={code}
            onChange={handleEditorChange}
            options={{ automaticLayout: true, formatOnType: true, formatOnPaste: true }} // Added format options
        />
    );
};

export default CodeEditor;
