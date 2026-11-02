import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Heading,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";

import { useSettings } from "../hooks/useSettings";
import { updateSettings } from "../apis/settings";

export default function SettingsPage() {
    const { settingsData, loading, error: settingsError, refresh } = useSettings();

    const [businessName, setBusinessName] = useState("");
    const [currency, setCurrency] = useState("");
    const [receiptFooter, setReceiptFooter] = useState("");
    const [timezone, setTimezone] = useState("");
    const [backupEnabled, setBackupEnabled] = useState(false);
    const [backupProvider, setBackupProvider] = useState("");
    const [storeLogo, setStoreLogo] = useState<File | null>(null);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (settingsData) {
            setBusinessName(settingsData.business_name ?? "");
            setCurrency(settingsData.currency ?? "");
            setReceiptFooter(settingsData.receipt_footer ?? "");
            setTimezone(settingsData.timezone ?? "");
            setBackupEnabled(settingsData.backup_enabled ?? false);
            setBackupProvider(settingsData.backup_provider ?? "");
        }
    }, [settingsData]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setSaveError("");
        setSuccess("");

        try {
            await updateSettings(
                businessName,
                currency,
                receiptFooter,
                timezone,
                backupEnabled,
                backupProvider,
                storeLogo
            );

            await refresh();

            setStoreLogo(null);
            setSuccess("Settings updated successfully.");
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Failed to update settings."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading && !settingsData) {
        return <Text>Loading settings...</Text>;
    }

    if (settingsError && !settingsData) {
        return <Text color="red.500">{settingsError}</Text>;
    }

    return (
        <Box p={6} maxW="800px">
            <VStack align="stretch" gap={6}>
                <Box>
                    <Heading size="lg">Business Settings</Heading>
                    <Text color="gray.500" fontSize="sm" mt={1}>
                        Manage your store information and system preferences.
                    </Text>
                </Box>

                {saveError && (
                    <Text color="red.500">{saveError}</Text>
                )}

                {success && (
                    <Text color="green.600">{success}</Text>
                )}

                <form onSubmit={handleSubmit}>
                    <VStack align="stretch" gap={5}>
                        <Box>
                            <Heading size="md" mb={3}>
                                Business Information
                            </Heading>

                            <VStack align="stretch" gap={3}>
                                <Box>
                                    <Text mb={1}>Business Name</Text>
                                    <Input
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        required
                                    />
                                </Box>

                                <Box>
                                    <Text mb={1}>Currency</Text>
                                    <Input
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        placeholder="e.g. GHS"
                                        required
                                    />
                                </Box>

                                <Box>
                                    <Text mb={1}>Store Logo</Text>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setStoreLogo(e.target.files?.[0] ?? null)
                                        }
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Select a new image to replace your current logo.
                                    </Text>
                                </Box>
                            </VStack>
                        </Box>

                        <Box>
                            <Heading size="md" mb={3}>
                                Receipt Preferences
                            </Heading>

                            <VStack align="stretch" gap={3}>
                                <Box>
                                    <Text mb={1}>Receipt Footer</Text>
                                    <Textarea
                                        value={receiptFooter}
                                        onChange={(e) => setReceiptFooter(e.target.value)}
                                        placeholder="e.g. Thank you for shopping with us!"
                                    />
                                </Box>
                            </VStack>
                        </Box>

                        <Box>
                            <Heading size="md" mb={3}>
                                Regional Preferences
                            </Heading>

                            <Box>
                                <Text mb={1}>Timezone</Text>
                                <Input
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    placeholder="e.g. Africa/Accra"
                                    required
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Heading size="md" mb={3}>
                                Backups
                            </Heading>

                            <VStack align="stretch" gap={3}>
                                <Box>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={backupEnabled}
                                            onChange={(e) =>
                                                setBackupEnabled(e.target.checked)
                                            }
                                        />
                                        {" "}Enable automatic backups
                                    </label>
                                </Box>

                                <Box>
                                    <Text mb={1}>Backup Provider</Text>
                                    <Input
                                        value={backupProvider}
                                        onChange={(e) => setBackupProvider(e.target.value)}
                                        placeholder="e.g. Google Drive"
                                        disabled={!backupEnabled}
                                    />
                                </Box>
                            </VStack>
                        </Box>

                        <Button
                            type="submit"
                            colorPalette="blue"
                            loading={saving}
                            disabled={saving || loading || !settingsData}
                            alignSelf="flex-start"
                        >
                            Save Settings
                        </Button>
                    </VStack>
                </form>
            </VStack>
        </Box>
    );
}