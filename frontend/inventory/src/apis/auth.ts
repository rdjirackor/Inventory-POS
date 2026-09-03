const API_URL = "http://127.0.0.1:8000/api"

export async function login(username:string, password: string) {
    const response = await fetch(`${API_URL}/login/`,{
        method: "POST",
        headers: {
            "Content-type":"application/json",          

        },
        body: JSON.stringify({
            username,
            password
        })
                });
        
        const data = await response.json();

        if (!response.ok){
            throw new Error(data.message || "Login Message");
        }
        return data;    
}

export async function getCurrentUser() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/me/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get current user");
    }

    return response.json();
}


    

