import { Flex, Heading, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";

type Props = {
    title: string;
    action?: ReactNode;
    maxW?: string;
    children: ReactNode;
};

function PageShell({ title, action, maxW = "100%", children }: Props) {
    return (
        <Stack gap={6} p={6} minH="100vh" w="100%" bg="gray.50">
            <Flex justify="space-between" align="center" gap={3}>
                <Heading size="xl">{title}</Heading>
                {action}
            </Flex>
            <Stack gap={4} w="100%" maxW={maxW} mx="auto">
                {children}
            </Stack>
        </Stack>
    );
}

export default PageShell;