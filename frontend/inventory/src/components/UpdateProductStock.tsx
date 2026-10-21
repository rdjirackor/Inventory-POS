import { useEffect, useState } from "react";
import type { Product } from "../interfaces/interfaces";
import { getProduct, patchProduct } from "../apis/products";
import { useNavigate, useParams } from "react-router-dom";




function UpdateProductStock(){

const [product, setProduct] = useState<Product >();
const { id } = useParams();
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

    async function fetchProduct() {

        try{
            setLoading(true);
            const data = await getProduct(Number(id));
            setProduct(data);
        }
        catch (error){
            setError("Failed to fetch Product");
        }
        finally{
            setLoading(false);
        }
        
    }
    useEffect(()=>{
        fetchProduct();
    },[id]);


    function handleChange(
        field: keyof Product,
        value: string | number
    ) {
        if (!product) return;

        setProduct({
            ...product,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    

    if (!product) return;

    setError("");
    setSaving(true);

    try {
        await patchProduct(product.id, {
            current_stock: Number(product.current_stock),
        });

        navigate("/products");
    } catch (error) {
        setError("Failed to update product");
    } finally {
        setSaving(false);
    }

}

    if (loading) {
        return <p>Loading product...</p>;
    }

    if (error && !product) {
        return <p>{error}</p>;
    }

    if (!product) {
        return <p>Product not found</p>;
    }

    return(
        <>
        </>

    )
    
}

