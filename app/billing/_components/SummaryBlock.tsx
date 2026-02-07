"use client";

import { useTotalAmount } from "@/lib/utils";
import { useBillingStore } from "@/store/useBillingStore";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SummaryBlock() {
  const { total, discountAmount, finalTotal } = useTotalAmount();
  const discount = useBillingStore((s: any) => s.discountPercent);
  const setDiscount = useBillingStore((s: any) => s.setDiscount);

  const [enabled, setEnabled] = useState(false);

  return (
    <div className="border rounded-xl p-5 bg-white dark:bg-zinc-900 shadow-sm space-y-4">

      {/* Sub Total */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">₹{total.toFixed(2)}</span>
      </div>

      {/* Discount Switch */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Discount</span>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => {
            setEnabled(v);
            if (!v) setDiscount(0);
          }}
        />
      </div>

      {/* Discount Input */}
      {enabled && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Discount %</span>
          <Input
            type="number"
            min={1}
            max={5}
            value={discount}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val < 1) val = 1;
              if (val > 5) val = 5;
              setDiscount(val);
            }}
            className="w-20 text-right"
          />
        </div>
      )}

      {/* Discount Amount */}
      {enabled && (
        <div className="flex justify-between text-sm text-red-500">
          <span>Discount Amount</span>
          <span>- ₹{discountAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
        <span>Grand Total</span>
        <span className="text-green-600">₹{finalTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
