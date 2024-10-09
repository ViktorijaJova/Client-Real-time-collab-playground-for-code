// src/components/CodeEditor.tsx
import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    onCodeChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange }) => {
    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onCodeChange(value);
        }
    };

    return (
        <MonacoEditor
            height="90vh"
            language="javascript"
            value={code}
            onChange={handleEditorChange}
            options={{ automaticLayout: true }}
        />
    );
};

export default CodeEditor;
