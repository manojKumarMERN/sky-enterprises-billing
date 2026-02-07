"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useBillingStore } from "@/store/useBillingStore";
import { productSchema } from "@/shared/schemas/productSchema";
import { customerSchema } from "@/shared/schemas/customerSchema";
import { toast } from "sonner";

export default function ProductBlock() {
  const tempItem = useBillingStore((s) => s.tempItem);
  const client = useBillingStore((s) => s.clientDetail);
  const setItem = useBillingStore((s) => s.setItem);
  const addOrUpdateItem = useBillingStore((s) => s.addOrUpdateItem);
  const isEditing = useBillingStore((s) => s.isEditing);

  const [errors, setErrors] = useState<any>({});

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setItem({ [id]: type === "number" ? Number(value) : value });
  };

  const handleAdd = () => {
    const clientResult = customerSchema.safeParse(client);
    if (!clientResult.success) {
      toast.error("Enter customer details first ❌");
      return;
    }
    const productResult = productSchema.safeParse(tempItem);
    if (!productResult.success) {
      setErrors(productResult.error.flatten().fieldErrors);
      toast.error("Fix product errors");
      return;
    }

    setErrors({});
    addOrUpdateItem();
    toast.success(isEditing ? "Product updated " : "Product added ");
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        {/* Product Name */}
        <Field>
          <FieldLabel htmlFor="name">Product Name</FieldLabel>
          <Input id="name" value={tempItem.name} onChange={handleInput} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name[0]}</p>}
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" value={tempItem.description} onChange={handleInput} />
        </Field>

        {/* Qty + Price */}
        <FieldSet className="!flex flex-row gap-4">
          <Field className="w-1/2">
            <FieldLabel htmlFor="qty">Quantity</FieldLabel>
            <Input id="qty" type="number" value={tempItem.qty} onChange={handleInput} />
            {errors.qty && <p className="text-red-500 text-xs">{errors.qty[0]}</p>}
          </Field>

          <Field className="w-1/2">
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <Input id="price" type="number" value={tempItem.price} onChange={handleInput} />
            {errors.price && <p className="text-red-500 text-xs">{errors.price[0]}</p>}
          </Field>
        </FieldSet>

        <Button className="w-full" onClick={handleAdd}>
          {isEditing ? "Update Product" : "Add to Bill"}
        </Button>
      </CardContent>
    </Card>
  );
}
