const API_URL = "http://127.0.0.1:8000/api";

export async function getSuppliers(){
    const token = localStorage.getItem("access_token");

    const response = await fetch (`${API_URL}/suppliers/`,{
        headers:{
            "Content-type":"application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();

    if (!response.ok){
        throw new Error(data.message|| "Get Suppliers Failed");
    }
    return data;
}

export async function createSupplier(
    name:string,
    products: number[],
    phone_number:string,
    email:string,
    address:string,
    contact_person:string,
    tax_number:string
){
    const token = localStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("name", name);

    products.forEach((product)=>{
    formData.append("product",product.toString())
    });
    formData.append("phone_number", phone_number);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("contact_person", contact_person);
    formData.append("tax_number", tax_number);

    const response = await fetch(`${API_URL}/suppliers/`,{
        method: "POST",
        headers:{
            Authorization: `Bearer ${token}`
        },
        body: formData,       

    });

    const data = await response.json();

    if (!response.ok){
        throw new Error(
            data.message || "Create Supplier Failed"
        );
    }
    return data;

}
