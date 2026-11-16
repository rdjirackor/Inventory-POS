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

//  <div>



        {/* {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
            <div>
                <label>User</label>
                <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>First Name</label>
                <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Second Name</label>
                <input
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Date Employed</label>
                <input
                    type="date"
                    value={dateEmployed}
                    onChange={(e) => setDateEmployed(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Branch</label>
                <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Cashier"}
            </button>

            <button
                type="button"
                onClick={() => navigate("/cashiers")}
            >
                Cancel
            </button>
        </form>
    </div> */}