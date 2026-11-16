import { Checkbox, Fieldset, Stack } from "@chakra-ui/react";

type Option = { value: number; label: string };

type CheckboxFieldProps = {
    label: string;
    options: Option[];
    selected: number[];
    onChange: (selected: number[]) => void;
};

export default function CheckboxField({ label, options, selected, onChange }: CheckboxFieldProps) {
    function toggle(value: number) {
        if (selected.includes(value)) {
            onChange(selected.filter((id) => id !== value));
        } else {
            onChange([...selected, value]);
        }
    }

    return (
        <Fieldset.Root>
            <Fieldset.Legend>{label}</Fieldset.Legend>
            <Fieldset.Content>
                <Stack gap={2}>
                    {options.map((o) => (
                        <Checkbox.Root
                            key={o.value}
                            checked={selected.includes(o.value)}
                            onCheckedChange={() => toggle(o.value)}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>{o.label}</Checkbox.Label>
                        </Checkbox.Root>
                    ))}
                </Stack>
            </Fieldset.Content>
        </Fieldset.Root>
    );
}