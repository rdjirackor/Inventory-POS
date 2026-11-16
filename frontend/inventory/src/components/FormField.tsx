import { Field, Input } from "@chakra-ui/react";
import type { ComponentProps } from "react";

type FormFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
} & Omit<ComponentProps<typeof Input>, "value" | "onChange">;

export default function FormField({ label, value, onChange, ...rest }: FormFieldProps) {
    return (
        <Field.Root>
            <Field.Label>{label}</Field.Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...rest}
            />
        </Field.Root>
    );
}