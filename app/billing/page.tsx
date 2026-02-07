"use client";

import { Button } from "@/components/ui/button";
import { useBillingStore } from "@/store/useBillingStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CompanyBlock from "./_components/CompanyBlock";
import CustomerBlock from "./_components/CustomerBlock";
import InvoiceTable from "./_components/InvoiceTable";
import ProductBlock from "./_components/ProductBlock";
import SignatureBlock from "./_components/SignatureBlock";
import SummaryBlock from "./_components/SummaryBlock";

export default function BillingPage() {
  const router = useRouter();

  const clientDetails = useBillingStore((s: any) => s.clientDetail);
  const items = useBillingStore((s: any) => s.items);


  const handleGenerateInvoice = () => {
    const noClient =
      !clientDetails?.name?.trim() || !clientDetails?.address?.trim(); const noItems = !items || items.length < 1;

    if (noClient) {
      toast.error("Please enter customer details");
      return;
    }

    if (noItems) {
      toast.error("Please add at least one product");
      return;
    }

    if (window.innerWidth < 600) {
      toast.warning("Invoice preview works best on desktop");
      router.push("/billing/invoice");
      return;
    }

    router.push("/billing/invoice");
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
