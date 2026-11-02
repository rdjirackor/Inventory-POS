import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

export function useSettings(){
const settingsContext = useContext(SettingsContext);
if (settingsContext === null){
    throw new Error("Settings Context is null");  
}
return settingsContext;
}