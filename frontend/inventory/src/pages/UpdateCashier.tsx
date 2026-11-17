import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Branch, Cashier, User } from "../interfaces/interfaces";
import { getCashier, patchCashier } from "../apis/cashiers";
import { Card, Field, Flex, Heading, NativeSelect, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import FormField from "../components/FormField";
import PageShell from "../components/PageShell";
import { getBranches } from "../apis/branches";
import { getUsers } from "../apis/users";

function UpdateCashier() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cashier, setCashier] = useState<Cashier | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [branches, setBranches] = useState<Branch[]>([]);

    const [users, setUsers] = useState<User[]>([]);


    useEffect(() => {
        async function fetchCashier() {
            try {
                const data = await getCashier(Number(id));
                setCashier(data);

                  const branchData = await getBranches();
                  setBranches(branchData);

                  const userData = await getUsers();
                  setUsers(userData);
            } catch (error) {
                setError("Failed to load Branches");
            } finally {
                setLoading(false);
            }
        }

        fetchCashier();
    }, [id]);

    function handleChange(
        field: keyof Cashier,
        value: string | number
    ) {
        if (!cashier) return;

        setCashier({
            ...cashier,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!cashier) return;

        setError("");
        setSaving(true);

        try {
            await patchCashier(
                cashier.id,
                cashier.first_name,
                cashier.second_name,
                cashier.date_employed,
                cashier.branch_stationed_at
            );

            navigate("/cashiers");
        } catch (error) {
            setError("Failed to update cashier");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading cashier...</p>;
    }

    if (error && !cashier) {
        return <p>{error}</p>;
    }

    if (!cashier) {
        return <p>Cashier not found</p>;
    }

    return (

           <div>
        
                    {error && <p>{error}</p>}
        <PageShell title="Edit Product" maxW="860px">
     
                    <form onSubmit={handleSubmit}>
        
                        <Card.Root>
                            <Card.Body gap={4}>
                                <Heading size="md">Basic info</Heading>
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>

                                    <Field.Root>
                    <Field.Label>User</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field value={cashier.user} onChange={(e) => handleChange(
                            "user",
                            e.target.value 
                        )}>
                            <option value="">Select User</option>
                 {users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.username}
                                            </option>
                                        ))}        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>



                                    <FormField label="Name" value={cashier.first_name} onChange={(val) =>
                                    handleChange("first_name", val)} />

                                    <FormField label="Second Name" value={cashier.second_name} onChange={(val) =>
                                    handleChange("second_name", val)} />



 <Field.Root>
                    <Field.Label>Branch Name</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field value={cashier.branch_name} onChange={(e) => handleChange(
                            "branch_name",
                            e.target.value 
                        )}>
                            <option value="">Select Branch</option>
                 {branches.map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name} - {branch.location}
                                            </option>
                                        ))}        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>

                                 


                                    <FormField label="Date Employed" value={cashier.date_employed} type="date" onChange={(val) =>
                                    handleChange("date_employed", val)} />
                                              
                                                
                                </SimpleGrid>
                            </Card.Body>
                        </Card.Root>
        
        
        <Flex justify="flex-end" gap={3}>
            <AppButton type="button" intent="secondary" onClick={() => navigate("/cashiers")}>
                Cancel
            </AppButton>
            <AppButton type="submit" loading={saving} loadingText="Updating...">
                Save Changes
            </AppButton>
        </Flex>
                      
        
                    </form>
                    </PageShell>
                </div>


       
    );
}

export default UpdateCashier;