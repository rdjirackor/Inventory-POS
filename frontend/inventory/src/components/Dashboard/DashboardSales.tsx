import { useState } from "react";
import type { Product } from "../../interfaces/interfaces";

function DashboardSales(){
    const [search, setSearch] = useState("");
    const [items,setItems] = useState<Product[]>([]);

    const filtered = items.filter(item=>item.name.toLowerCase().includes(search.toLowerCase()));
    return(
        <>
        
        </>
    )


}