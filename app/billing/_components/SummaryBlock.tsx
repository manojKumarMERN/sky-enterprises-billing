"use client";

import { useTotalAmount } from "@/lib/utils";
import { useBillingStore } from "@/store/useBillingStore";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function SummaryBlock() {
    const { total } = useTotalAmount();

    const enabled = useBillingStore((s: any) => s.discountEnabled);
    const discountPercent = useBillingStore((s: any) => s.discountPercent);
    const discountFlat = useBillingStore((s: any) => s.discountFlat);

    const setEnabled = useBillingStore((s: any) => s.setDiscountEnabled);
    const setDiscountPercent = useBillingStore((s: any) => s.setDiscountPercent);
    const setDiscountFlat = useBillingStore((s: any) => s.setDiscountFlat);



    // CALCULATIONS
    const percentAmount = (total * discountPercent) / 100;
    const finalTotal = total - percentAmount - discountFlat;

    return (
        <Card>
            <CardContent className="p-5 shadow-md space-y-4">


                    {/* SUBTOTAL */}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{total.toFixed(2)}</span>
                    </div>

                    {/* DISCOUNT SWITCH */}
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Apply Discount</span>
                        <Switch
                            checked={enabled}
                            onCheckedChange={(v) => {
                                setEnabled(v);
                                if (!v) {
                                    setDiscountPercent(0);
                                    setDiscountFlat(0);
                                }
                            }}
                        />
                    </div>

                    {/* DISCOUNT % INPUT */}
                    {enabled && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Discount %</span>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                value={discountPercent}
                                onChange={(e) => {
                                    let val = Number(e.target.value);
                                    if (val < 1) val = 1;
                                    if (val > 5) val = 5;
                                    setDiscountPercent(val);
                                }}
                                className="w-20 text-right"
                            />
                        </div>
                    )}

                    {/* FLAT DISCOUNT INPUT */}
                    {enabled && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Flat Discount (₹)</span>
                            <Input
                                type="number"
                                min={0}
                                value={discountFlat}
                                onChange={(e) => setDiscountFlat(Number(e.target.value))}
                                className="w-24 text-right"
                            />
                        </div>
                    )}

                    {/* SHOW DISCOUNT VALUES */}
                    {enabled && (
                        <div className="text-sm space-y-1 text-red-500">
                            <div className="flex justify-between">
                                <span>Percent Discount</span>
                                <span>- ₹{percentAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Flat Discount</span>
                                <span>- ₹{discountFlat.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {/* GRAND TOTAL */}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                        <span>Grand Total</span>
                        <span className="font-bold">
                            ₹{finalTotal > 0 ? finalTotal.toFixed(2) : "0.00"}
                        </span>
                    </div>
            </CardContent>
        </Card>
    );
}
