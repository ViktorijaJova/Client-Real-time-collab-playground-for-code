// src/utils/api.ts
import axios from 'axios';

// Use the local URL if it is available, otherwise fall back to the production URL
const API_BASE_URL = 'http://localhost:4000/api'; // Change as needed for production
//const API_BASE_URL = 'https://obscure-retreat-63973-92abc2c62e6e.herokuapp.com/api'; // Change as needed for production

// Function to create a new session
export const createSession = async ({ creatorId, code }: { creatorId: string; code: string }) => {
    const response = await axios.post(`${API_BASE_URL}/sessions`, {
        creatorId,
        code,
    });
    return response.data; // This should return the session object from your API
};

// Function to update session code
export const updateSessionCode = async (sessionId: string, code: string) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/sessions/${sessionId}`, { code });
        return response.data; // Return the updated session data if needed
    } catch (error) {
        console.error('Error updating session code:', error);
        throw error; // Re-throw to handle it in the calling function if needed
    }
};

// Function to get a session by ID
export const getSession = async (sessionId: string) => {
    const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
    return response.data; // Expecting the session details to be returned
};
