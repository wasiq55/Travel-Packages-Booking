import {
    createContext,
    useContext,
    useState
} from "react";

import {
    registerUser,
    loginUser,
    logoutUser
} from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("travelUser");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const register = async (userData) => {
        try {
            setLoading(true);
            setError("");

            const data = await registerUser(userData);

            if (data.success) {
                setUser(data.user);

                localStorage.setItem(
                    "travelUser",
                    JSON.stringify(data.user)
                );
            }

            return data;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Registration failed";

            setError(message);

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        try {
            setLoading(true);
            setError("");

            const data = await loginUser(userData);

            if (data.success) {
                setUser(data.user);

                localStorage.setItem(
                    "travelUser",
                    JSON.stringify(data.user)
                );
            }

            return data;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Login failed";

            setError(message);

            throw error;
        } finally {
            setLoading(false);
        }
    };


    const logout = async () => {
        try {
            setLoading(true);
            await logoutUser();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Logout request failed"
            );
        } finally {
            setUser(null);
            localStorage.removeItem("travelUser");
            setLoading(false);
        }
    };

    const clearError = () => {
        setError("");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                logout,
                clearError,
                isAuthenticated: Boolean(user)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};