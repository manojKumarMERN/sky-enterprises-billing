"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useBillingStore } from "@/store/useBillingStore";
import { customerSchema } from "@/shared/schemas/customerSchema";
import { Field, FieldLabel } from "@/components/ui/field";

export default function CustomerBlock() {
    const client = useBillingStore((s) => s.clientDetail);
    const setClient = useBillingStore((s) => s.setClient);

    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setClient({ [id]: value });

        const result = customerSchema.safeParse({ ...client, [id]: value });
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
        } else {
            setErrors({});
        }
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <h2 className="font-semibold">Customer Details</h2>

                <div>
                    <Field>
                        <FieldLabel htmlFor="name">Customer Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="Customer Name"
                            value={client.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name[0]}</p>}
                    </Field>
                </div>

                <div>
                    <Field>
                        <FieldLabel htmlFor="address">Customer Address</FieldLabel>
                        <Input
                            id="address"
                            placeholder="Customer Address"
                            value={client.address}
                            onChange={handleChange}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs">{errors.address[0]}</p>
                        )}
                    </Field>
                </div>

                <div>
                    <Field>
                        <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                        <Input
                            id="phone"
                            placeholder="Phone Number"
                            value={client.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone[0]}</p>}
                    </Field>
                </div>
            </CardContent>
        </Card>
    );
}
