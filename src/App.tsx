import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { io } from "socket.io-client";
import CreateSession from "./components/CreateSession";
import JoinSession from "./components/JoinSession";

const socket = io("http://localhost:4000");

const App: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionLink, setSessionLink] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false); // Lock state for participants only
  const [lockStatusMessage, setLockStatusMessage] = useState<string | null>(
    null
  );
  const [participants, setParticipants] = useState<string[]>([]); // Store participant usernames

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  const kickParticipant = (userName: string) => {
    if (sessionId) {
      socket.emit("kickParticipant", sessionId, userName);

      // Immediately update the frontend to remove the kicked participant
      setParticipants((prevParticipants) =>
        prevParticipants.filter((participant) => participant !== userName)
      );
    }
  };
  

  const lockSession = () => {
    if (sessionId) {
      socket.emit("lockSession", sessionId);
    }
  };

  const unlockSession = () => {
    if (sessionId) {
      socket.emit("unlockSession", sessionId);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    // Lock the session for participants only
    socket.on("sessionLocked", () => {
        console.log("Session locked received");
        if (role !== "creator") {
          setIsLocked(true); // Lock for participants
          setLockStatusMessage("The session is now locked. You cannot edit the code.");
        }
      });
      
      socket.on("sessionUnlocked", () => {
        console.log("Session unlocked received");
        if (role !== "creator") {
          setIsLocked(false); // Unlock for participants
          setLockStatusMessage("The session is now unlocked. You can edit the code again.");
        }
      });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Receive code changes from other participants
    socket.on("codeChange", (newCode: string) => {
      undoStack.current.push(code);
      setCode(newCode);
    });

    socket.on("codeOutput", (newOutput: string) => {
      if (newOutput.startsWith("Error:")) {
        setError(newOutput);
        setOutput(null);
      } else {
        setOutput(newOutput);
        setError(null);
      }
    });

    socket.on('currentParticipants', (participants: string[]) => {
        const uniqueParticipants = Array.from(new Set(participants)); // Remove duplicates
        setParticipants(uniqueParticipants);
    });

    socket.on("participantJoined", (userName: string) => {
      setParticipants((prev) => [...prev, userName]);
    });

    socket.on("participantKicked", (userName: string) => {
      // If the kicked participant is the current user, redirect to the welcome screen
      if (userName === role) {
        alert(`You have been kicked from session ${sessionId}`);
        setSessionId(null);
        setParticipants([]); // Clear participants list
        setCode(""); // Clear code
      } else {
        setParticipants((prev) => prev.filter((p) => p !== userName));
      }
    });

    return () => {
      socket.off("codeChange");
      socket.off("codeOutput");
      socket.off("sessionLocked");
      socket.off("sessionUnlocked");
      socket.off("connect");
      socket.off("currentParticipants");
      socket.off("disconnect");
      socket.off("participantJoined");
      socket.off("participantKicked");
    };
  }, [code, role]);

  const handleCodeChange = (newValue: string | undefined) => {
    if (newValue && (!isLocked || role === "creator")) {
      // Allow changes if not locked or user is the creator
      undoStack.current.push(code);
      redoStack.current = [];
      setCode(newValue);
      socket.emit("codeChange", { sessionId, code: newValue });
    }
  };

  const handleUndo = () => {
    if ((!isLocked || role === "creator") && undoStack.current.length > 0) {
      // Allow undo if not locked or user is creator
      const previousCode = undoStack.current.pop();
      redoStack.current.push(code);
      if (previousCode !== undefined) {
        setCode(previousCode);
        socket.emit("codeChange", { sessionId, code: previousCode });
      }
    }
  };

  const handleRedo = () => {
    if ((!isLocked || role === "creator") && redoStack.current.length > 0) {
      // Allow redo if not locked or user is creator
      const nextCode = redoStack.current.pop();
      undoStack.current.push(code);
      if (nextCode !== undefined) {
        setCode(nextCode);
        socket.emit("codeChange", { sessionId, code: nextCode });
      }
    }
  };

  const handleSessionCreated = (id: string, userRole: string) => {
    setSessionId(id);
    setRole(userRole);
    setSessionLink(`http://localhost:3000/session/${id}`);
    socket.emit("joinSession", id, userRole); // Include user role
  };

  const handleSessionJoined = (
    id: string,
    initialCode: string,
    userRole: string
  ) => {
    setSessionId(id);
    setCode(initialCode);
    setRole(userRole);
    console.log(`Joined session ${id} as ${userRole}`);
    socket.emit("joinSession", id, userRole);
    // Include user role
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionLink);
    alert("Session link copied to clipboard!");
  };

  return (
    <div className="h-screen bg-pink-200 flex flex-col items-center justify-center p-6">
      {!sessionId ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-400 mb-6">
            Welcome to My Coding Playground
          </h1>
          <CreateSession onSessionCreated={handleSessionCreated} />
          <JoinSession onSessionJoined={handleSessionJoined} />
        </div>
      ) : (
        <div className="text-center w-full">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            Welcome to Session: {sessionId} 
          </h2>
          {sessionLink && (
            <div className="mb-4">
              <p className="mb-2 text-blue-400">
                Share this link to join the session:
              </p>
              <div className="flex justify-center items-center space-x-2">
                <input
                  type="text"
                  value={sessionLink}
                  readOnly
                  className="w-1/2 p-2 text-white bg-blue-300 border rounded-lg text-center"
                />
                <button
                  className="bg-blue-300 text-white px-4 py-2 rounded-lg"
                  onClick={handleCopyLink}
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
          <Editor
            height="60vh"
            language="javascript"
            value={code}
            onChange={handleCodeChange}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              readOnly: isLocked && role !== "creator", // Lock for participants but not the creator
            }}
            className="border border-blue-400 rounded-lg"
          />
          
    <ul className="text-white pt-2" id="participant-list">
        <span >Participants:</span>
    {participants.map((participant, index) => (
        <li key={index}>
            {participant}
            {role === 'creator' && participant !== 'creator' && (
                <button
                    className="bg-red-400 ml-2  text-white px-3 py-1 rounded"
                    onClick={() => kickParticipant(participant)}
                >
                    Kick
                </button>
            )}
        </li>
    ))}
</ul>

{role === 'creator'  && (

            <div className="flex justify-center space-x-4 mt-4">
        
              <button
                className="bg-blue-300 text-white px-4 py-2 rounded-lg"
                onClick={lockSession}
              >
                Lock Session
              </button>
              <button
                className="bg-blue-300 text-white px-4 py-2 rounded-lg"
                onClick={unlockSession}
              >
                Unlock Session
              </button>
            </div>
)}
            {role !== 'creator' && lockStatusMessage && (

            <div className="mt-4 bg-blue-300 text-white p-4 rounded-lg">
              <h3>{lockStatusMessage}</h3>
            </div>
            )}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              className="bg-red-400 text-white px-4 py-2 rounded-lg"
              onClick={handleUndo}
            >
              Undo
            </button>
            <button
              className="bg-green-400 text-white px-4 py-2 rounded-lg"
              onClick={handleRedo}
            >
              Redo
            </button>
          </div>
          {output && (
            <div className="mt-6 bg-green-200 p-4 rounded-lg">
              <h3>Output:</h3>
              <pre>{output}</pre>
            </div>
          )}
          {error && (
            <div className="mt-6 bg-yellow-200 p-4 rounded-lg text-black">
              <h3>Error:</h3>
              <pre>{error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
