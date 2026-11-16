import { Field, NativeSelect } from "@chakra-ui/react";

type Option = { value: string | number; label: string };

type SelectFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder: string;
};

export default function SelectField({ label, value, onChange, options, placeholder }: SelectFieldProps) {
    return (
        <Field.Root>
            <Field.Label>{label}</Field.Label>
            <NativeSelect.Root>
                <NativeSelect.Field value={value} onChange={(e) => onChange(e.target.value)}>
                    <option value="">{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
            </NativeSelect.Root>
        </Field.Root>
    );
}