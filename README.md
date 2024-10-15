Getting Started with Create React App
This project was bootstrapped with Create React App.

Available Scripts
In the project directory, you can run:

npm start
Runs the app in development mode.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

npm test
Launches the test runner in the interactive watch mode.
See the section about running tests for more information.

npm run build
Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes.
Your app is ready to be deployed!

npm run eject
Note: this is a one-way operation. Once you eject, you can’t go back!

This command will copy all configuration files and dependencies into your project, allowing full control over build tools like Webpack and Babel.

Real-Time Code Playground
This project is a real-time collaborative code playground. It allows users to create and join coding sessions where they can edit and run code together. Sessions are managed using web sockets and include features like session locking, participant management, and undo/redo functionality.

Components:
CreateSession: Allows users to create a new coding session.
JoinSession: Allows users to join an existing coding session using a session link.
Both components are integrated with the App.tsx file. Here’s a brief overview of the main features:

Main Features:
Collaborative Editing: The code editor, powered by Monaco Editor, updates in real-time across users via web sockets.
Session Management: Only the session creator can manage the session, including kicking participants, locking/unlocking the session, and sharing a session link.
Undo/Redo Functionality: Available to all participants, allowing users to revert or redo code changes.
Session Locking: The session creator can lock the session to prevent participants from editing.
WebSockets: Used for real-time communication between participants using Socket.io.