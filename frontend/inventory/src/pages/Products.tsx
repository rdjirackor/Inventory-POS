import { useEffect, useState } from "react";
import { getProducts } from "../apis/products";
import type { Product } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../apis/products";
import { Alert, Spinner, Card, Flex, Table, Box, Text, Image, Badge } from "@chakra-ui/react";
import { Plus,   PackagePlus, Pencil, Trash2 } from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";

function Products() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [products, setProducts] = useState<Product[]>([]);

    const navigate = useNavigate();

    

    async function fetchProducts(){
        setError("");
        setLoading(true);
        try{
            const data = await getProducts();
            setProducts(data);
        }
        catch(error){
            setError("Failed to load products");
        }
        finally{
            setLoading(false);
        }
    }

async function DeleteProduct(product: Product) {
    if (!confirm(`Delete ${product.name}?`)) return;
    try {
        await deleteProduct(product.id);
        await fetchProducts();
    } catch (error) {
        setError(
            error instanceof Error && error.message === "Protected"
                ? "Cannot delete this product because it is used in existing orders or stock movements."
                : "Failed to delete product."
        );
    }
}


    useEffect(() => {
        fetchProducts()
    },[]);

   function UpdateProducts(product_id: number){
    navigate(`/products/${product_id}/edit`);
   }

    return (
       <PageShell
    title="Products"
    action={
        <AppButton onClick={() => navigate("/products/create")}>
            <Plus size={16} /> Create Product
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
    ) : products.length === 0 ? (
        <Text color="gray.500">No products yet.</Text>
    ) : (
        <Card.Root>
            <Table.ScrollArea>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Product</Table.ColumnHeader>
                            <Table.ColumnHeader>Category</Table.ColumnHeader>
                            <Table.ColumnHeader>Taxes</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Stock</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {products.map(product => (
                            <Table.Row key={product.id}>
                                <Table.Cell>
                                    <Flex align="center" gap={3}>
                                        {product.image ? (
                                            <Image
                                                src={`http://127.0.0.1:8000${product.image}`}
                                                alt={product.name}
                                                boxSize="48px"
                                                objectFit="cover"
                                                borderRadius="md"
                                            />
                                        ) : (
                                            <Box boxSize="48px" bg="gray.100" borderRadius="md" />
                                        )}
                                        <Text fontWeight="medium">{product.name}</Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>{product.category_name}</Table.Cell>
                                <Table.Cell>{product.taxes_names}</Table.Cell>
                                <Table.Cell textAlign="end">
                                    <Badge
                                        colorPalette={
                                            Number(product.current_stock) <= Number(product.minimum_stock_level)
                                                ? "red"
                                                : "green"
                                        }
                                    >
                                        {product.current_stock}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex justify="flex-end" gap={1}>
                                        <AppIconButton label="Adjust stock" intent="secondary"
                                            onClick={() => navigate(`/products/${product.id}/stock`)}>
                                            <PackagePlus size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Edit product" intent="secondary"
                                            onClick={() => UpdateProducts(product.id)}>
                                            <Pencil size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Delete product" intent="danger"
                                            onClick={() => DeleteProduct(product)}>
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

export default Products;