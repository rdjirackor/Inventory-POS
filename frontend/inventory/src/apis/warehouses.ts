const API_URL = "http://127.0.0.1:8000/api"

export async function getWarehouses() {
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
export async function getWarehouse(warehouse_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/warehouses/${warehouse_id}/`,
        {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Warehouse Failed");
    }

    return data;
}

export async function updateWarehouse(
    warehouse_id: number,
    name: string,
    location: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/warehouses/${warehouse_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                location,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Warehouse Failed");
    }

    return data;
}

export async function patchWarehouse(
    warehouse_id: number,
    name?: string,
    location?: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/warehouses/${warehouse_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...(name !== undefined && { name }),
                ...(location !== undefined && { location }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Warehouse Failed");
    }

    return data;
}

export async function deleteWarehouse(warehouse_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/warehouses/${warehouse_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Warehouse Failed");
    }
}