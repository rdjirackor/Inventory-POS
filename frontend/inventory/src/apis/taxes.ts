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