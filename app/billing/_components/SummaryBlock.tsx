"use client";

import { useTotalAmount } from "@/lib/utils";
import { useBillingStore } from "@/store/useBillingStore";


export default function SummaryBlock() {
    const items = useBillingStore((s:any) => s.items);
    const total = useTotalAmount();

    return (
        <div className="border rounded-xl p-4 text-right">
            <p className="text-lg font-bold">Total: ₹{total}</p>
        </div>
    );
}
