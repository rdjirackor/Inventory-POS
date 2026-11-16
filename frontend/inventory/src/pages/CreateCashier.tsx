import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCashier } from "../apis/cashiers";
import { type Branch, type User } from "../interfaces/interfaces";
import { getBranches } from "../apis/branches";

import { getUsers } from "../apis/users";
import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import FormField from "../components/FormField";
import SelectField from "../components/SelectField";



function CreateCashier() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState("");

    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [dateEmployed, setDateEmployed] = useState("");

    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchId, setBranchId] = useState("");


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");



    useEffect(() => {
    async function fetchOptions() {
        try {
            const [userData, branchData] = await Promise.all([
                getUsers(),
                getBranches(),
            ]);

            setUsers(userData);
            setBranches(branchData);
        } catch (error) {
            console.error(error);
            setError("Failed to load users and branches");
        }
    }

    fetchOptions();
}, []);


    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
        await createCashier(
            Number(userId),
            firstName,
            secondName,
            dateEmployed,
            Number(branchId),
        );

        navigate("/cashiers");
    } catch (error) {
        setError("Failed to create cashier");
        console.error(error);
    } finally {
        setLoading(false);
    }
}

  

    return (

         <div>
                        {error && <p>{error}</p>}
        
                    <form onSubmit={handleSubmit}>
                     <Card.Root>
                                <Card.Body gap={4}>
                                    <Heading size="md">Basic info</Heading>
                                    <SimpleGrid columns={{ base: 2, md: 2 }} gap={4}>
                    <SelectField label="User" value={userId} onChange={setUserId} options={users.map((c) => ({ value: c.id, label: c.username }))} placeholder="Select User" />
                    <FormField label="First Name" value={firstName} onChange={setFirstName} />
                    <FormField label="Second Name" value={secondName} onChange={setSecondName} />
                    <FormField label="Date Employed" value={dateEmployed} onChange={setDateEmployed} />
                    <SelectField label="Branch" value={branchId} onChange={setBranchId} options={branches.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select Branch" />

                     </SimpleGrid>
                                </Card.Body>
                            </Card.Root>              
        
                      
                          <Flex justify="flex-end" gap={3}>
                    <AppButton type="button" intent="secondary" onClick={() => navigate("/categories")}>
                        Cancel
                    </AppButton>
                    <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating...">
                        Create Category
                    </AppButton>
                </Flex>
        
                    </form>
                </div>



   
);

               
}

export default CreateCashier;