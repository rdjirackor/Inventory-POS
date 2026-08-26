const API_URL = "http://127.0.0.1:8000/api"

export async function getWarehouse() {
    const token = localStorage.getItem("access_token");

    const response = await fetch (`${API_URL}/warehouses/`,{
        headers:{
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Get Warehouses Failed");
    }
    console.log(data);
    return data;
    
    
}

export async function createWarehouse(
    name: string,
    location: string,
){
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("location", location);

    const response = await fetch(`${API_URL}/warehouses`,{
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Warehouse creation failed"
        );
    }
    return data;

}