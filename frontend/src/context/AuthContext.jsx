import { createContext, useContext, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
        ? JSON.parse(savedUser)
        : null;
});
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        try {
            setLoading(true);

            const response = await API.post("/auth/login", {
                email,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);

            return {
                success: true
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Login failed"
            };

        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};