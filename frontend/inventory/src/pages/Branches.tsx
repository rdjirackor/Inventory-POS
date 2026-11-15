import { useEffect, useState } from "react";
import {  deleteBranch, getBranch, getBranches } from "../apis/branches";
import type { Branch } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";

function Branches() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);

    async function fetchBranches() {
        setError("");
        setLoading(true);

        try {
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            setError("Failed to load Branches");
        } finally {
            setLoading(false);
        }
    }

    async function DeleteBranch(branch_id:number) {
        try {
            const branch = await getBranch(branch_id);
            const confirmed = confirm(`Delete ${branch.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteBranch(branch_id);

            await fetchBranches();
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
        fetchBranches();
    }, []);

    return (

            <PageShell
            title="Branchs"
            action={
                <AppButton onClick={() => navigate("/branchs/create")}>
                    <Plus size={16} /> Create Branch
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
            ) : branches.length === 0 ? (
                <Text color="gray.500">No branchs yet.</Text>
            ) : (
                <Card.Root>
                    <Table.ScrollArea>
                        <Table.Root interactive>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                                    <Table.ColumnHeader>Location</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                             
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {branches.map(branch => (
                                    <Table.Row key={branch.id}>
        
                                        <Table.Cell>{branch.name}</Table.Cell>
                                        <Table.Cell>{branch.location}</Table.Cell>
                                      
        
                                   
                                        <Table.Cell>
                                            <Flex justify="flex-end" gap={1}>
                                           
                                                <AppIconButton label="Edit branch" intent="secondary"
                                                    onClick={() => navigate(`/branchs/${branch.id}/edit`)}>
                                                    <Pencil size={16} />
                                                </AppIconButton>
                                                <AppIconButton label="Delete branch" intent="danger"
                                                    onClick={() => DeleteBranch(branch.id)}>
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

export default Branches;