"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBillingStore } from "@/store/useBillingStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { COMPANY_INFO } from "@/shared/constants/company";
import CompanyBlock from "./_components/CompanyBlock";
import CustomerBlock from "./_components/CustomerBlock";
import InvoiceTable from "./_components/InvoiceTable";
import ProductBlock from "./_components/ProductBlock";
import SummaryBlock from "./_components/SummaryBlock";
import { handleDownload } from "@/lib/utils";

export default function BillingPage() {
  const router = useRouter();
  const ourDetail = COMPANY_INFO;

  const clientDetails = useBillingStore((s: any) => s.clientDetail);
  const saveInvoiceToLocal = useBillingStore((s: any) => s.saveInvoiceToLocal);
  const items = useBillingStore((s: any) => s.items);
  const discountPercent = useBillingStore((s: any) => s.discountPercent);
  const discountFlat = useBillingStore((s: any) => s.discountFlat);

  const loadDraftInvoice = useBillingStore((s: any) => s.loadDraftInvoice);
  const clearDraftInvoice = useBillingStore((s: any) => s.clearDraftInvoice);

  const searchParams = useSearchParams();
  const editNo = searchParams.get("edit");
  const setEditingInvoice = useBillingStore(s => s.setEditingInvoice);

  useEffect(() => {
    if (!editNo) return;

    const raw = localStorage.getItem(`invoice_${editNo}`);
    if (!raw) return;

    const inv = JSON.parse(raw);

    loadDraftInvoice(inv.data);
    setEditingInvoice(editNo);
  }, [editNo]);


  const invoiceData = {
    company: ourDetail?.companyName,
    location: ourDetail?.officeLocation,
    tagLine: ourDetail?.tagLine,
    phone: ourDetail?.officePhone,
    client: {
      name: clientDetails?.name || "N/A",
      address: clientDetails?.address || "N/A",
      phone: clientDetails?.phone || "N/A",
    },
    items,
    discountPercent,
    discountFlat,
  };

  const handleGenerateInvoice = () => {
    const noClient =
      !clientDetails?.name?.trim() || !clientDetails?.address?.trim();
    const noItems = !items || items.length < 1;

    if (noClient) {
      toast.error("Please enter customer details");
      return;
    }

    if (noItems) {
      toast.error("Please add at least one product");
      return;
    }

    handleDownload(invoiceData, saveInvoiceToLocal);
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
      <CompanyBlock />

      <div className="grid md:grid-cols-2 gap-6">
        <CustomerBlock />
        <ProductBlock />
      </div>

      <InvoiceTable />

      <div className="grid md:grid-cols-2 gap-6">
        <SummaryBlock />
        <Button variant="secondary" onClick={handleGenerateInvoice}>
          Generate Invoice
        </Button>
      </div>
    </div>
  );
}
