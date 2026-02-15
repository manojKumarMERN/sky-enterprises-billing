"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-switch";
import { HomeIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isInvoicePreview = pathname?.includes("/billing/invoice");

  return (
    <div className="relative w-full min-h-screen">

      {!isInvoicePreview && (
        <>
          <div className="fixed top-5 left-5 z-50">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
            >
              <HomeIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="fixed top-5 right-5 z-50">
            <ModeToggle />
          </div>
        </>
      )}

      {children}
    </div>
  );
}