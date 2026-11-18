import { Checkbox } from "@chakra-ui/react";

type CheckboxInputProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export default function CheckboxInput({ label, checked, onChange }: CheckboxInputProps) {
    return (
        <Checkbox.Root
            checked={checked}
            onCheckedChange={(details) => onChange(details.checked === true)}
        >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{label}</Checkbox.Label>
        </Checkbox.Root>
    );
}