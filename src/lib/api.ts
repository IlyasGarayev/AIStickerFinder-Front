import axios from 'axios';

// In a real scenario, this might come from an env var, but the prompt specifies localhost:8080
// We'll use a relative path if it's proxied, or the direct URL if we are in dev.
// Since we are in a container, we might need to be careful. 
// However, the prompt explicitly says "The backend is at http://localhost:8080".
// In the AI Studio preview, localhost:8000 inside the container is NOT accessible from the browser 
// unless it's proxied or we are running the backend in the same container.
// Assuming the user has a backend running on port 8080 in the same environment 
// OR they are running it locally and we are just building the frontend.
// Given the constraints, I will use the environment variable if present, else default.

export const BASE_URL = (import.meta.env.VITE_API_URL || 'https://aistickerfinder-git-91281591862.europe-west1.run.app').replace(/\/$/, '');

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  console.log('Outgoing Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

export interface Sticker {
  sticker_id: string;
  file_path: string;
  image_url: string;
  match_explanation?: string;
  confidence_score?: number;
  is_animated?: boolean;
}

export interface SearchResponse {
  query: string;
  results: Sticker[];
  total_indexed: number;
}

export interface StatsResponse {
  status: string;
  total_indexed_stickers: number;
  storage_dir: string;
  vision_model: string;
  pro_model: string;
  embedding_model: string;
}
