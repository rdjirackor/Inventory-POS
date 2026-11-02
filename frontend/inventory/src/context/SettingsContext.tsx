import { createContext, useEffect, useState } from "react";
import type { Settings } from "../interfaces/interfaces";
import { getSettings } from "../apis/settings";

type SettingsContextType = {
    settingsData: Settings | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};
export const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settingsData, setSettingsData] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchSettings(){
        setError("");
        setLoading(true);

        try{
            const data =await getSettings();
            setSettingsData(data);
        }
        catch(error){
            setError("Failed to load settings");
        }
        finally{
            setLoading(false);
        }



    }
    useEffect(()=>{
        fetchSettings();
    },[])

    async function refresh(){
        await fetchSettings();

    }

    return (
        <SettingsContext.Provider
            value={{
                settingsData,
                loading,
                error,
                refresh,
            }}>
                {children}

            </SettingsContext.Provider>
    );

}
