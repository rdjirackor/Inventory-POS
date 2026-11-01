
import { Button } from "@chakra-ui/react";
import type { ComponentProps, MouseEventHandler } from "react";
import { Check, AlertCircle } from "lucide-react";

type Intent = "primary" | "danger" | "secondary";
type Feedback = "success" | "error" | undefined;

type AppButtonProps = Omit<
    ComponentProps<typeof Button>,
    "variant" | "colorPalette" | "onClick"
> & {
    intent?: Intent;
    feedback?: Feedback;
    haptic?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};



function AppButton({
    intent = "primary",
    feedback,
    haptic = true,
    onClick,
    children,
    ...props
}: AppButtonProps) {

    function handleClick(
        event: React.MouseEvent<HTMLButtonElement>
    ) {
        if (
            haptic &&
            typeof navigator !== "undefined" &&
            "vibrate" in navigator
        ) {
            navigator.vibrate(10);
        }

        onClick?.(event);
    }

    const styles = {
        primary: {
            bg: "#2563EB",
            color: "white",
            border: "1px solid transparent",
            _hover: { bg: "#1D4ED8" },
            _active: { bg: "#1E40AF" },
            _focusVisible: {
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.3)"
            }
        },

        danger: {
            bg: "#DC2626",
            color: "white",
            border: "1px solid transparent",
            _hover: { bg: "#B91C1C" },
            _active: { bg: "#991B1B" },
            _focusVisible: {
                boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.3)"
            }
        },

        secondary: {
            bg: "white",
            color: "#374151",
            border: "1px solid #D1D5DB",
            _hover: { bg: "#F3F4F6" },
            _active: { bg: "#E5E7EB" },
            _focusVisible: {
                boxShadow: "0 0 0 3px rgba(107, 114, 128, 0.2)"
            }
        }
    };

    return (
        <Button
            {...props}
            {...styles[intent]}
            onClick={handleClick}
            borderRadius="lg"
            fontWeight="semibold"
            height="40px"
            px={4}
            transition="all 150ms ease"
            transform="translateY(0)"
            _active={{
                ...styles[intent]._active,
                transform: "scale(0.97)"
            }}
            _disabled={{
                opacity: 0.5,
                cursor: "not-allowed",
                transform: "none"
            }}
        >
            {feedback === "success" && (
                <Check size={16} />
            )}

            {feedback === "error" && (
                <AlertCircle size={16} />
            )}

            {children}
        </Button>
    );
}

export default AppButton;
