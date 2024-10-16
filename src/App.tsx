import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { io } from "socket.io-client";
import CreateSession from "./components/CreateSession";
import JoinSession from "./components/JoinSession";

//const socket = io("https://obscure-retreat-63973-92abc2c62e6e.herokuapp.com"); // for production
const socket = io("http://localhost:4000"); // for local testing

const App: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionLink, setSessionLink] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockStatusMessage, setLockStatusMessage] = useState<string | null>(
    null
  );
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [showLockStatusMessage, setShowLockStatusMessage] = useState(false);

  const kickParticipant = (userName: string) => {
    if (sessionId) {
      socket.emit("kickParticipant", sessionId, userName);
      // Immediately update the frontend to remove the kicked participant
      setParticipants((prevParticipants) =>
        prevParticipants.filter((participant) => participant !== userName)
      );
    }
  };

  const handleRunCode = () => {
    if (sessionId) {
      socket.emit("runCode", { sessionId, code });
    }
  };
  

  const handleTyping = () => {
    if (sessionId) {
      socket.emit("typing", { role, userName: role });
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
    socket.on("connect", () => {});

    socket.on("sessionLocked", () => {
      if (role !== "creator") {
        setIsLocked(true);
        setLockStatusMessage(
          "The session is now locked. You cannot edit the code sorry!"
        );
        setShowLockStatusMessage(true); // Show the message
        // Hide message after 3 seconds
        setTimeout(() => {
          setShowLockStatusMessage(false);
        }, 3000);
      }
    });

    socket.on("typingIndicator", ({ userName }) => {
      setTypingUser(userName);
      const typingTimeout = setTimeout(() => {
        setTypingUser(null);
      }, 2000);

      return () => clearTimeout(typingTimeout);
    });

    socket.on("sessionUnlocked", () => {
      if (role !== "creator") {
        setIsLocked(false);
        setLockStatusMessage(
          "The session is now unlocked. You can edit the code again yeyy!"
        );
        setShowLockStatusMessage(true); // Show the message
        // Hide message after 3 seconds
        setTimeout(() => {
          setShowLockStatusMessage(false);
        }, 3000);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

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

    socket.on("currentParticipants", (participants: string[]) => {
      const uniqueParticipants = Array.from(new Set(participants)); // Remove duplicates
      setParticipants(uniqueParticipants);
    });

    socket.on("participantJoined", (userName: string) => {
      setParticipants((prev) => [...prev, userName]);
    });

    socket.on("participantKicked", (userName: string) => {
      // If the kicked participant is the current user, redirect to the welcome screen
      if (userName === role) {
        alert(`Snap! You have been kicked from session ${sessionId}`);
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
  }, [code, socket,role]);

  const handleCodeChange = (newValue: string | undefined) => {
    if (newValue && (!isLocked || role === "creator")) {
      undoStack.current.push(code);
      redoStack.current = [];
      setCode(newValue);
      socket.emit("codeChange", { sessionId, code: newValue });
      handleTyping();
    }
  };

  const handleUndo = () => {
    if ((!isLocked || role === "creator") && undoStack.current.length > 0) {
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
      const nextCode = redoStack.current.pop();
      undoStack.current.push(code);
      if (nextCode !== undefined) {
        setCode(nextCode);
        socket.emit("codeChange", { sessionId, code: nextCode });
      }
    }
  };

  const handleSessionCreated = (id: string, userRole: string, initialCode: string) => {
    setSessionId(id);
    setRole(userRole);
    setCode(initialCode); // Set the initial code for the creator
    socket.emit("codeChange", { sessionId: id, code: initialCode }); // Emit the initial code to all participants
       setSessionLink(`http://localhost:3000/session/${id}`); // for production

    // Set the session link
   // setSessionLink(`https://client-real-time-collab-playground-for-code.vercel.app/session/${id}`); // for production
    socket.emit("joinSession", id, userRole);
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

          <div className="relative">
            <Editor
              height="60vh"
              language="javascript"
              value={code}
              onChange={(newValue) => {
                handleCodeChange(newValue);
                handleTyping();
              }}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                readOnly: isLocked && role !== "creator",
              }}
              className="border border-blue-400 rounded-lg"
            />
            {typingUser && (
              <div className="absolute left-0 right-0 bottom-0 bg-blue-200 text-white p-2 rounded-lg">
                {typingUser === "creator"
                  ? "Creator is typing..."
                  : `${typingUser} is typing...`}
              </div>
            )}
          </div>
          <ul className="text-white pt-2" id="participant-list">
            <span>Participants:</span>
            {participants.map((participant, index) => (
              <li key={index}>
                {participant}
                {role === "creator" && participant !== "creator" && (
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

          {role === "creator" && (
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
          {role !== "creator" && lockStatusMessage && showLockStatusMessage && (
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
            <button
    className="bg-blue-400 text-white px-4 py-2 rounded-lg"
    onClick={handleRunCode} // Add this button for running code
  >
    Run Code
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
