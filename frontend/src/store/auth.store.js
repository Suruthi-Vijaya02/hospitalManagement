import { create } from "zustand";

const useAuthStore = create((set) => ({
    user: null,
    token: null,

    setAuth: (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        set({
            user: data.user,
            token: data.token,
        });
    },

    loadAuth: () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (token && user) {
            set({ token, user });
        }
    },

    logout: () => {
        localStorage.clear();
        set({ user: null, token: null });
    },
}));

export default useAuthStore;