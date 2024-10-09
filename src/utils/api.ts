// src/utils/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api'; // Use localhost for local development

export const createSession = async (creatorId: string) => {
    const response = await axios.post(`${API_BASE_URL}/sessions`, {
        creatorId,
    });
    return response.data; // Return the created session
};

export const getSession = async (sessionId: string) => {
    const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
    return response.data; // Return session data
};
