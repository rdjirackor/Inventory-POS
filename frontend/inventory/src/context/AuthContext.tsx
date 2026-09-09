import { createContext, useState } from "react";

type AuthContextType = {
    accessToken: string | null;
    refreshToken: string | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem("access_token")
    );

    const [refreshToken, setRefreshToken] = useState<string | null>(
        localStorage.getItem("refresh_token")
    );

    function login(access: string, refresh: string) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        setAccessToken(access);
        setRefreshToken(refresh);
    }

    function logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAccessToken(null);
        setRefreshToken(null);
    }

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}