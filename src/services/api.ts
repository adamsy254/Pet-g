import axios from "axios";

/**
 * Base URL is relative ("/api") so:
 *  - In dev:  Vite proxy → http://localhost:8080
 *  - In prod: same origin → Spring Boot serves both SPA and API
 */
export const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT on every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("petgrooming_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Clear auth state if the server rejects the token
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("petgrooming_token");
            localStorage.removeItem("petgrooming_user");
        }
        return Promise.reject(err);
    }
);