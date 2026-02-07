"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useBillingStore } from "@/store/useBillingStore";
import { productSchema } from "@/shared/schemas/productSchema";
import { customerSchema } from "@/shared/schemas/customerSchema";
import CategorySelect from "./productDropdown";
import { ITEMS_BY_CATEGORY } from "@/shared/constants/products";

export default function ProductBlock() {
  const tempItem = useBillingStore((s) => s.tempItem);
  const client = useBillingStore((s) => s.clientDetail);
  const setItem = useBillingStore((s) => s.setItem);
  const addOrUpdateItem = useBillingStore((s) => s.addOrUpdateItem);
  const isEditing = useBillingStore((s) => s.isEditing);

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isNameDisabled, setIsNameDisabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // When editing, set the category based on tempItem
  useEffect(() => {
    if (tempItem.category) setSelectedCategory(tempItem.category);
  }, [tempItem]);

  const handleSelectChange = (selectedId: string) => {
    if (selectedId === "other") {
      setItem({ name: "", category: "" });
      setIsNameDisabled(false);
      setSelectedCategory(null);
      return;
    }

    let foundCategory: string | null = null;
    let selectedItem = null;
    for (const [category, items] of Object.entries(ITEMS_BY_CATEGORY)) {
      selectedItem = items.find((i) => i.id === selectedId);
      if (selectedItem) {
        foundCategory = category;
        break;
      }
    }

    if (selectedItem) {
      setItem({ name: selectedItem.name, price: selectedItem.price, category: foundCategory || "" });
      setIsNameDisabled(true);
      setSelectedCategory(foundCategory);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const val = type === "number" ? Number(value) : value;

    setItem({ [id]: val });

    if (id === "name") setIsNameDisabled(false);

    // Auto-calculate price for Wooden Boards / Finishes
    if (selectedCategory === "Wooden Boards" || selectedCategory === "Finishes") {
      const qty = id === "qty" ? Number(val) : tempItem.qty || 1;
      const sqft = id === "sqft" ? Number(val) : tempItem.sqft || 0;
      const rate = id === "rate" ? Number(val) : tempItem.rate || 0;

      const totalPrice =
        selectedCategory === "Wooden Boards" ? qty * sqft * rate : sqft * rate;

      setItem({ price: totalPrice });
    }
  };

  const handleAdd = () => {
    if (!customerSchema.safeParse(client).success) {
      toast.error("Enter customer details first");
      return;
    }

    const result = productSchema.safeParse(tempItem);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      toast.error("Fix product errors before adding");
      return;
    }

    setErrors({});
    addOrUpdateItem();
    toast.success(isEditing ? "Product updated" : "Product added");
  };

  const isWoodenBoard = selectedCategory === "Wooden Boards";
  const isFinish = selectedCategory === "Finishes";

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        {/* CATEGORY SELECT */}
        <CategorySelect value={tempItem.id || ""} onChange={handleSelectChange} />

        {/* PRODUCT NAME */}
        <Field>
          <FieldLabel htmlFor="name">Product Name</FieldLabel>
          <Input
            id="name"
            value={tempItem.name}
            onChange={handleInput}
            disabled={isNameDisabled}
            placeholder={isNameDisabled ? "" : "Enter custom product name"}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name[0]}</p>}
        </Field>

        {/* DESCRIPTION */}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            value={tempItem.description}
            onChange={handleInput}
          />
        </Field>

        {/* Wooden Boards: Qty + Sqft + Rate */}
        {isWoodenBoard && (
          <FieldSet className="!flex flex-row gap-4">
            <Field className="w-1/3">
              <FieldLabel htmlFor="qty">Quantity</FieldLabel>
              <Input
                id="qty"
                type="number"
                value={tempItem.qty}
                onChange={handleInput}
              />
              {errors.qty && <p className="text-red-500 text-xs">{errors.qty[0]}</p>}
            </Field>

            <Field className="w-1/3">
              <FieldLabel htmlFor="sqft">Square Footage (sqft)</FieldLabel>
              <Input
                id="sqft"
                type="number"
                value={tempItem.sqft || ""}
                onChange={handleInput}
                placeholder="Enter area in sqft"
              />
              {errors.sqft && <p className="text-red-500 text-xs">{errors.sqft[0]}</p>}
            </Field>

            <Field className="w-1/3">
              <FieldLabel htmlFor="rate">Rate per sqft</FieldLabel>
              <Input
                id="rate"
                type="number"
                value={tempItem.rate || ""}
                onChange={handleInput}
                placeholder="Enter rate per sqft"
              />
              {errors.rate && <p className="text-red-500 text-xs">{errors.rate[0]}</p>}
            </Field>
          </FieldSet>
        )}

        {/* Finishes: Sqft + Rate */}
        {isFinish && (
          <FieldSet className="!flex flex-row gap-4">
            <Field className="w-1/2">
              <FieldLabel htmlFor="sqft">Square Feet (sqft)</FieldLabel>
              <Input
                id="sqft"
                type="number"
                value={tempItem.sqft || ""}
                onChange={handleInput}
                placeholder="Enter area in sqft"
              />
              {errors.sqft && <p className="text-red-500 text-xs">{errors.sqft[0]}</p>}
            </Field>

            <Field className="w-1/2">
              <FieldLabel htmlFor="rate">Rate per sqft</FieldLabel>
              <Input
                id="rate"
                type="number"
                value={tempItem.rate || ""}
                onChange={handleInput}
                placeholder="Enter rate per sqft"
              />
              {errors.rate && <p className="text-red-500 text-xs">{errors.rate[0]}</p>}
            </Field>
          </FieldSet>
        )}

        {/* Other categories: Qty + Price */}
        {!isWoodenBoard && !isFinish && (
          <FieldSet className="!flex flex-row gap-4">
            <Field className="w-1/2">
              <FieldLabel htmlFor="qty">Quantity</FieldLabel>
              <Input
                id="qty"
                type="number"
                value={tempItem.qty}
                onChange={handleInput}
              />
              {errors.qty && <p className="text-red-500 text-xs">{errors.qty[0]}</p>}
            </Field>

            <Field className="w-1/2">
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <Input
                id="price"
                type="number"
                value={tempItem.price}
                onChange={handleInput}
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price[0]}</p>}
            </Field>
          </FieldSet>
        )}

        <Button className="w-full" onClick={handleAdd}>
          {isEditing ? "Update Product" : "Add to Bill"}
        </Button>
      </CardContent>
    </Card>
  );
}
