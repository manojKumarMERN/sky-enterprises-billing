"use client";

import { useEffect } from "react";
import { useBillingStore } from "@/store/useBillingStore";
import { COMPANY_INFO } from "@/shared/constants/company";
import InvoiceTemplate from "../_components/_invoice/tempate";
import { Download, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { handleDownload } from "@/lib/utils";

export default function InvoicePage() {
    const router = useRouter();

    const clientDetails = useBillingStore((s: any) => s.clientDetail);
    const items = useBillingStore((s: any) => s.items);
    const ourDetail = COMPANY_INFO;

    useEffect(() => {
        const noClient =
            !clientDetails?.name?.trim() || !clientDetails?.address?.trim();
        const noItems = !items || items.length < 1;

        if (noClient || noItems) {
            router.replace("/billing");
        }
    }, [clientDetails, items, router]);

    const invoiceData = {
        company: ourDetail?.companyName,
        location: ourDetail?.officeLocation,
        tagLine: ourDetail?.tagLine,
        phone: ourDetail?.officePhone,
        client: {
            name: clientDetails?.name || "N/A",
            address: clientDetails?.address || "N/A",
        },
        items: items || [],
    };

    console.log(invoiceData ,"invoice" );


    return (
        <div className="min-h-screen bg-zinc-50 p-6 dark:bg-black">
            <div className="flex justify-between max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
                    Invoice Preview
                </h1>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/billing")}
                        className="group flex items-center gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </Button>

                    <Button onClick={()=>{
                        handleDownload(invoiceData)
                    }} className="group flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            <InvoiceTemplate data={invoiceData} />
        </div>
    );
}
