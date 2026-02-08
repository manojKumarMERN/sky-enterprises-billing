import { Suspense } from "react";
import BillingPage from "./_components/BillingClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <img src="/asset.svg" alt="Loading..." className="w-16 h-16" />
        </div>
      }
    >
      <BillingPage />
    </Suspense>
  );
}
