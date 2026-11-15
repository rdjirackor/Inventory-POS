import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TaxType } from "../interfaces/interfaces";
import { deleteTax, getTax, getTaxes } from "../apis/taxes";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus,  PackagePlus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";



function Taxtype (){
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error,setError] = useState("");
    const [taxtypes, setTaxTypes] =useState<TaxType[]>([]);

    async function fetchTaxtype(){
        setError("");
        setLoading(true);

        try{

        const data = await getTaxes();
        setTaxTypes(data);
         }
        catch (error){
            setError("Failed to load tax types.")
        }
        finally{
            setLoading(false);
        }
    }
    async function DeleteTaxes(tax_id:number) {
            try {
                const tax = await getTax(tax_id);
                const confirmed = confirm(`Delete ${tax.name}?`);
                if (!confirmed){
                    return ;
                }
                await deleteTax(tax_id);
    
                await fetchTaxtype();
            }
            catch(error){
                if (error instanceof Error && error.message === "Protected") {
                    setError(
                        "Cannot delete this"
                    );
                }
            }
            
        }
        useEffect(() => {
                fetchTaxtype();
            }, []);
        
            return (
               <PageShell
    title="Taxtypes"
    action={
        <AppButton onClick={() => navigate("/taxtypes/create")}>
            <Plus size={16} /> Create Taxtype
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
    ) : taxtypes.length === 0 ? (
        <Text color="gray.500">No taxtypes yet.</Text>
    ) : (
        <Card.Root>
            <Table.ScrollArea>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Active</Table.ColumnHeader>
                            <Table.ColumnHeader >Rate</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                     
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {taxtypes.map(taxtype => (
                            <Table.Row key={taxtype.id}>

                                <Table.Cell>{taxtype.name}</Table.Cell>
                                <Table.Cell>{taxtype.active ? "Active": "Inactive"}</Table.Cell>
                              
                                <Table.Cell>{taxtype.rate}</Table.Cell>
                           
                                <Table.Cell>
                                    <Flex justify="flex-end" gap={1}>
                                        <AppIconButton label="Adjust stock" intent="secondary"
                                            onClick={() => navigate(`/taxtypes/${taxtype.id}/stock`)}>
                                            <PackagePlus size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Edit taxtype" intent="secondary"
                                            onClick={() => navigate(`/taxtypes/${taxtype.id}/edit`)}>
                                            <Pencil size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Delete taxtype" intent="danger"
                                            onClick={() => DeleteTaxes(taxtype.id)}>
                                            <Trash2 size={16} />
                                        </AppIconButton>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </Card.Root>
    )}
</PageShell>
            );
        }
        
        export default Taxtype;

    


