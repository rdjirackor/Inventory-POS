import { useEffect, useState } from "react";
import { deleteSupplier, getSuppliers } from "../apis/suppliers";
import type { Supplier } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus,  PackagePlus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";

function Suppliers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    
    const navigate = useNavigate();


    async function fetchSuppliers(){
        setError("");
        setLoading(true)
        try{
            const data = await getSuppliers();
            console.log("Supplier API data:", data);
            setSuppliers(data);
        }
        catch(error){
            setError("Failed to load Suppliers");
        }
        finally{
            setLoading(false);
        }
    }

    async function DeleteSupplier(supplier_id: number) {
        try {
            await deleteSupplier(supplier_id);
            await fetchSuppliers();
        } catch (error) {
            if (error instanceof Error && error.message === "Protected") {
                setError(
                    "Cannot delete this supplier because it is used in existing orders or stock movements."
                );
            }
        }
    }





    useEffect(() => {
        fetchSuppliers()
    },[]);

   function UpdateSuppliers(supplier_id: number){
    navigate(`/suppliers/${supplier_id}/edit`);
   }

    return (

        <PageShell
    title="Suppliers"
    action={
        <AppButton onClick={() => navigate("/suppliers/create")}>
            <Plus size={16} /> Create Supplier
        </AppButton>
    }
>
    {error && (
        <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
    )}

    {loading ? (
        <Spinner />
    ) : suppliers.length === 0 ? (
        <Text color="gray.500">No suppliers yet.</Text>
    ) : (
        <Card.Root>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Phone Number</Table.ColumnHeader>
                            <Table.ColumnHeader>Product Names</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Address</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Email</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Contact Person</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Tax Number</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {suppliers.map(supplier => (
                            <Table.Row key={supplier.id}>

                                <Table.Cell>{supplier.name}</Table.Cell>
                                <Table.Cell>{supplier.phone_number}</Table.Cell>
                                <Table.Cell textAlign="end">
                                           {supplier.product_names? supplier.product_names.join(", ") : "No supplied Products!" }
                                </Table.Cell>
                                <Table.Cell>{supplier.address}</Table.Cell>
                                <Table.Cell>{supplier.email}</Table.Cell>
                                <Table.Cell>{supplier.contact_person}</Table.Cell>
                                <Table.Cell>{supplier.tax_number}</Table.Cell>
                                <Table.Cell>
                                    <Flex justify="flex-end" gap={1}>
                                        <AppIconButton label="Adjust stock" intent="secondary"
                                            onClick={() => navigate(`/suppliers/${supplier.id}/stock`)}>
                                            <PackagePlus size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Edit supplier" intent="secondary"
                                            onClick={() => UpdateSuppliers(supplier.id)}>
                                            <Pencil size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Delete supplier" intent="danger"
                                            onClick={() => DeleteSupplier(supplier.id)}>
                                            <Trash2 size={16} />
                                        </AppIconButton>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
        </Card.Root>
    )}
</PageShell>
        
       
    );
}

export default Suppliers;

