import { Suspense } from "react";
import BillingPage from "./_components/BillingClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingPage />
    </Suspense>
  );
}
