const API_URL = "http://127.0.0.1:8000/api"

export async function getTaxes(){
    const token = localStorage.getItem("access_token");

    const response = await fetch (`${API_URL}/taxes/`,{
        headers:{
            "Content-type":"application/json",
            Authorization : `Bearer ${token}`,
        },
    });
    const data = await response.json();   

    if(!response.ok){
        throw new Error(data.message || "Get taxes failed")
    }
    return data; 
}

export async function createTax(
    name:string,
    rate:number,
    active:boolean
){
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("rate", rate.toString());
    formData.append("active", active ? "true": "false");

    const response = await fetch (`${API_URL}/taxes/`,{
        method:"POST",
        headers: {
        "Authorization": `Bearer ${token}`,  
        "Content-Type": "multipart/form-data",    
    },
    body:formData,
});
const data = await response.json();

if (!response.ok){
    throw new Error(
        data.message || "Tax creation failed"
    );
}
return data;
}

export async function getTax(tax_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/taxes/${tax_id}/`,
        {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Tax Failed");
    }

    return data;
}

export async function updateTax(
    tax_id: number,
    name: string,
    rate: number,
    active: boolean
) {
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("rate", rate.toString());
    formData.append("active", active ? "true" : "false");

    const response = await fetch(
        `${API_URL}/taxes/${tax_id}/`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Tax Failed");
    }

    return data;
}

export async function patchTax(
    tax_id: number,
    name?: string,
    rate?: number,
    active?: boolean
) {
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    if (name !== undefined) formData.append("name", name);
    if (rate !== undefined) formData.append("rate", rate.toString());
    if (active !== undefined) {
        formData.append("active", active ? "true" : "false");
    }

    const response = await fetch(
        `${API_URL}/taxes/${tax_id}/`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Tax Failed");
    }

    return data;
}

export async function deleteTax(tax_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/taxes/${tax_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Tax Failed");
    }
}