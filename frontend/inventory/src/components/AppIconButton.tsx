import AppButton from "./AppButton";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof AppButton> & { label: string };

function AppIconButton({ label, children, ...props }: Props) {
    return (
        <AppButton aria-label={label} title={label} height="32px" minW="32px" px={0} {...props}>
            {children}
        </AppButton>
    );
}

export default AppIconButton;