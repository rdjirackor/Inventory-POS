import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../apis/customers";
import { type User } from "../interfaces/interfaces";
import { getBranches } from "../apis/branches";

import { getUsers } from "../apis/users";

import { Card, Field, Flex, Heading, Input, NativeSelect, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";



function CreateCustomer() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState("");

    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [rewardPoints, setRewardPoints] = useState("");
    const [creditBalance, setCreditBalance] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
    async function fetchOptions() {
        try {
            const [userData] = await Promise.all([
                getUsers(),
                getBranches(),
            ]);

            setUsers(userData);
        } catch (error) {
            console.error(error);
            setError("Failed to load users");
        }
    }

    fetchOptions();
}, []);


    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
        await createCustomer(
            Number(userId),
            firstName,
            secondName,
            rewardPoints,
            creditBalance,
            
        );

        navigate("/customers");
    } catch (error) {
        setError("Failed to create customer");
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
        
                              <Field.Root>
                    <NativeSelect.Root>
                        <NativeSelect.Field value={userId}  onChange={(e) => setUserId(e.target.value)}>
                            <option value="">Select a User</option>
                   {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                                            </option>
                                        ))}        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>
                     <Field.Root>
                                <Field.Label>First Name</Field.Label>
                                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </Field.Root>
                              <Field.Root>
                                <Field.Label>Second Name</Field.Label>
                                <Input value={secondName} onChange={(e) => setSecondName(e.target.value)} />
                            </Field.Root>
                           
                                        <Field.Root>
                                <Field.Label>Reward Points</Field.Label>
                                <Input value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} />
                            </Field.Root>
                                      
                                 <Field.Root>
                                <Field.Label>Credit Balance</Field.Label>
                                <Input value={creditBalance} onChange={(e) => setCreditBalance(e.target.value)} />
                            </Field.Root>
                                   
                                       
                                      
                                   
                                        
                                        
                        </SimpleGrid>
                    </Card.Body>
                </Card.Root>
                
                <Flex justify="flex-end" gap={3}>
                    <AppButton type="button" intent="secondary" onClick={() => navigate("/customers")}>
                        Cancel
                    </AppButton>
                    <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating...">
                        Create Customer
                    </AppButton>
                </Flex>
                
                </form>
                            
                
                            
                        </div>
   
);

               
}

export default CreateCustomer;