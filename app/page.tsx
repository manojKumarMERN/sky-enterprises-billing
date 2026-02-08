"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit,PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StoredInvoice {
  invoiceNo: string;
  createdAt: number;
  expiryTime: number;
  data: {
    client: { name: string; address: string };
    items: any[];
    discountPercent?: number;
    discountFlat?: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const list = Object.keys(localStorage)
        .filter((k) => k.startsWith("invoice_"))
        .map((k) => JSON.parse(localStorage.getItem(k) || "{}"));

      setInvoices(list);
      setLoading(false);
    }, 800); // fake loading for UX
  }, []);

  // Calculate Grand Total
  const calculateGrandTotal = (inv: StoredInvoice) => {
    const items = inv.data?.items || [];
    const discountPercent = inv.data?.discountPercent || 0;
    const discountFlat = inv.data?.discountFlat || 0;

    const subTotal = items.reduce((sum, item) => {
      if (item.sqft && item.rate) return sum + item.qty * item.sqft * item.rate;
      return sum + item.qty * item.price;
    }, 0);

    const percentDiscountAmount = (subTotal * discountPercent) / 100;
    return subTotal - percentDiscountAmount - discountFlat;
  };

  const deleteInvoice = (invoiceNo: string) => {
    localStorage.removeItem(`invoice_${invoiceNo}`);
    setInvoices((prev) => prev.filter((i) => i.invoiceNo !== invoiceNo));
  };

  const editInvoice = (inv: StoredInvoice) => {
    router.push(`/billing?edit=${inv.invoiceNo}`);
  };


  const sortedInvoices = [...invoices].sort((a, b) => b.createdAt - a.createdAt);

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + calculateGrandTotal(inv),
    0
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">SKY Enterprises - Invoice Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage drafts, customers, and billing history
            </p>
          </div>

          <Button onClick={() => router.push("/billing")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </>
          ) : (
            <>
              <Card>
                <CardHeader><CardTitle>Total Invoices</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">
                  {invoices.length}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">
                  ₹{totalRevenue.toFixed(2)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Active Drafts</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">
                  {sortedInvoices.length}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* TABLE */}
        <div className="border rounded-xl bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* LOADING SKELETON */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && sortedInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                sortedInvoices.map((inv) => (
                  <TableRow key={inv.invoiceNo}>
                    <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                    <TableCell>{inv.data?.client?.name || "N/A"}</TableCell>
                    <TableCell>{inv.data?.items?.length || 0}</TableCell>

                    <TableCell>
                      {inv.data.discountPercent || 0}% + ₹{inv.data.discountFlat || 0}
                    </TableCell>

                    <TableCell className="font-semibold">
                      ₹{calculateGrandTotal(inv).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="text-right flex gap-2 justify-end">

                      <Button size="sm" onClick={() => editInvoice(inv)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteInvoice(inv.invoiceNo)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
