import { useEffect, useState } from "react";
import { deleteCategory, getCategories, getCategory } from "../apis/categories";
import type { Category } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";


import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";

function Categories() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    async function fetchCategories() {
        setError("");
        setLoading(true);

        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            setError("Failed to load Categories");
        } finally {
            setLoading(false);
        }
    }

    async function DeleteCategory(category_id:number) {
        try {
            const category = await getCategory(category_id);
            const confirmed = confirm(`Delete ${category.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteCategory(category_id);

            await fetchCategories();
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
        fetchCategories();
    }, []);

    return (
        <PageShell
            title="Categories"
            action={
                <AppButton onClick={() => navigate("/categorys/create")}>
                    <Plus size={16} /> Create Category
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
            ) : categories.length === 0 ? (
                <Text color="gray.500">No categories yet.</Text>
            ) : (
                <Card.Root>
                    <Table.ScrollArea>
                        <Table.Root interactive>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                             
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {categories.map(category => (
                                    <Table.Row key={category.id}>
        
                                        <Table.Cell>{category.name}</Table.Cell>
                                      
        
                                   
                                        <Table.Cell>
                                            <Flex justify="flex-end" gap={1}>
                                           
                                                <AppIconButton label="Edit category" intent="secondary"
                                                    onClick={() => navigate(`/categories/${category.id}/edit`)}>
                                                    <Pencil size={16} />
                                                </AppIconButton>
                                                <AppIconButton label="Delete category" intent="danger"
                                                    onClick={() => DeleteCategory(category.id)}>
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

export default Categories;