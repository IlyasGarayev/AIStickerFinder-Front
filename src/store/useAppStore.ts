import { create } from 'zustand';
import { api, SearchResponse, Sticker, StatsResponse } from '../lib/api';

interface AppState {
  searchQuery: string;
  results: Sticker[];
  isSearching: boolean;
  totalIndexed: number;
  stats: StatsResponse | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  searchStickers: (query: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  triggerIndexing: () => Promise<any>;
  syncPack: (url: string) => Promise<any>;
}

export const useAppStore = create<AppState>((set, get) => ({
  searchQuery: '',
  results: [],
  isSearching: false,
  totalIndexed: 0,
  stats: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchStickers: async (query) => {
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }

    set({ isSearching: true });
    try {
      const response = await api.post<SearchResponse>('/search', { query });
      set({ 
        results: response.data.results, 
        totalIndexed: response.data.total_indexed,
        isSearching: false 
      });
    } catch (error) {
      console.error('Search failed:', error);
      set({ results: [], isSearching: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get<StatsResponse>('/health');
      set({ stats: response.data, totalIndexed: response.data.total_indexed_stickers });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  triggerIndexing: async () => {
    const response = await api.post('/index');
    return response.data;
  },

  syncPack: async (url) => {
    const response = await api.post('/sync-pack', { pack_url: url });
    return response.data;
  }
}));
