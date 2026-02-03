const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

export const api = {
    async getSessions() {
        const response = await fetch(`${API_BASE_URL}/sessions`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        return response.json();
    },

    async createSession(title = 'New Chat') {
        const url = new URL(`${API_BASE_URL}/sessions`);
        url.searchParams.append('title', title);

        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create session');
        return res.json();
    },

    async getSessionMessages(sessionId) {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    async deleteSession(sessionId) {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete session');
        return response.json();
    },

    async renameSession(sessionId, newTitle) {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
        });
        if (!response.ok) throw new Error('Failed to rename session');
        return response.json();
    },

    async sendMessage(sessionId, message, file = null) {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('message', message);
        if (file) {
            formData.append('file', file);
        }

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to send message');
        }

        return response; // Return the response object for streaming
    }
};
