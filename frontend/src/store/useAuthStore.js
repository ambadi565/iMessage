import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/api";     

const useAuthStore = create((set, get) => ({
    authUser: null,
    setAuthUser: (user) => set({ authUser: user }),
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const response = await axiosInstance.get("/auth/check");
            set({authUser: response.data})

            get().connectSocket(response.data);
            
        } catch (error) {
            console.error("Error checking auth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    clearAuth: () => {
        set({ authUser: null , isCheckingAuth: false, onlineUsers: []});
        get().disconnectSocket();
    },

    connectSocket: (user) => {
        if(!user || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: user._id,
            },
        });
        set({ socket });

        socket.on("getOnlineUsers", (users) => {
            set({ onlineUsers: users });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) socket.disconnect();
        
        set({ socket: null });
        
    }
}));

export default useAuthStore;