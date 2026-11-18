import { useEffect, useState } from "react";
import { getTaxes, updateTax } from "../apis/taxes";
import type { TaxType } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";
import CheckboxInput from "../components/CheckboxInput";

function UpdateTaxtype() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [taxtype, setTaxtype] = useState<TaxType | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTaxtype() {
            try {
                const taxtypes = await getTaxes();

                const foundTaxtype = taxtypes.find(
                    (taxtype) => taxtype.id === Number(id)
                );

                if (!foundTaxtype) {
                    setError("Taxtype not found");
                    return;
                }

                setTaxtype(foundTaxtype);
            } catch (error) {
                setError("Failed to load Taxtype");
            } finally {
                setLoading(false);
            }
        }

        fetchTaxtype();
    }, [id]);

  function handleNameChange(value: string) {
    if (!taxtype) return;
    setTaxtype({ ...taxtype, name: value });
}

function handleRateChange(value: string) {
    if (!taxtype) return;

    setTaxtype({
        ...taxtype,
        rate: value === "" ? "" : Number(value),
    });
}

function handleActiveChange(value: boolean) {
    if (!taxtype) return;
    setTaxtype({ ...taxtype, active: value });
}



    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!taxtype) return;

        setError("");
        setSaving(true);

        try {
            await updateTax(
                taxtype.id,
                taxtype.name,
                Number(taxtype.rate),
                taxtype.active,

            );

            navigate("/taxtypes");
        } catch (error) {
            setError("Failed to update Taxtype");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading Taxtype...</p>;
    }

    if (!taxtype) {
        return <p>{error || "Taxtype not found"}</p>;
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

                            <FormField label="Taxtype" value= {taxtype.name} onChange={(e) => handleNameChange(e)} />
                            <FormField label="Rate" type="number" value={String(taxtype.rate)} onChange={(e) => handleRateChange(e)} />
                            <CheckboxInput
                                label="Active"
                                checked={taxtype.active}
                                onChange={handleActiveChange}
                            />      
                             <FormField label="Taxtype" value= {taxtype.name} onChange={(e) => handleNameChange(e)} />


                          

                                          
                                     </SimpleGrid>
                                 </Card.Body>
                             </Card.Root>
             
             
             <Flex justify="flex-end" gap={3}>
                 <AppButton type="button" intent="secondary" onClick={() => navigate("/products")}>
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

export default UpdateTaxtype;