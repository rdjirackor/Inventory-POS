import { useEffect, useState } from "react";
import { getCategories, updateCategory } from "../apis/categories";
import type { Category } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField";
import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";

function UpdateCategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCategory() {
            try {
                const categories = await getCategories();

                const foundCategory = categories.find(
                    (category) => category.id === Number(id)
                );

                if (!foundCategory) {
                    setError("Category not found");
                    return;
                }

                setCategory(foundCategory);
            } catch (error) {
                setError("Failed to load category");
            } finally {
                setLoading(false);
            }
        }

        fetchCategory();
    }, [id]);

    function handleChange(value: string) {
        if (!category) return;

        setCategory({
            ...category,
            name: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!category) return;

        setError("");
        setSaving(true);

        try {
            await updateCategory(
                category.id,
                category.name
            );

            navigate("/categories");
        } catch (error) {
            setError("Failed to update category");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading category...</p>;
    }

    if (!category) {
        return <p>{error || "Category not found"}</p>;
    }

    return (
        <div>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                  <Card.Root>
                                            <Card.Body gap={4}>
                                                <Heading size="md">Basic info</Heading>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormField label="Category Name" value={category.name} onChange={(val) =>
                                                    handleChange(val)} />
                                                    </SimpleGrid>
                                                    </Card.Body>
                                                    </Card.Root>
                                                    




          <Flex justify="flex-end" gap={3}>
            <AppButton type="button" intent="secondary" onClick={() => navigate("/categories")}>
                Cancel
            </AppButton>
            <AppButton type="submit" loading={saving} loadingText="Updating...">
                Save Changes
            </AppButton>
        </Flex>
            </form>
        </div>
    );
}

export default UpdateCategory;