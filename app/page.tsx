"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, PlusCircle, X } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // Load invoices
  useEffect(() => {
    setTimeout(() => {
      const list = Object.keys(localStorage)
        .filter((k) => k.startsWith("invoice_"))
        .map((k) => JSON.parse(localStorage.getItem(k) || "{}"));

      setInvoices(list);
      setLoading(false);
    }, 500);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Calculate Grand Total
  const calculateGrandTotal = (inv: StoredInvoice) => {
    const items = inv.data?.items || [];
    const discountPercent = inv.data?.discountPercent || 0;
    const discountFlat = inv.data?.discountFlat || 0;

    const subTotal = items.reduce((sum, item) => {
      if (item.sqft && item.rate) return sum + item.qty * item.sqft * item.rate;
      return sum + item.qty * item.price;
    }, 0);

    return subTotal - (subTotal * discountPercent) / 100 - discountFlat;
  };



  const deleteInvoice = (invoiceNo: string) => {
    localStorage.removeItem(`invoice_${invoiceNo}`);
    setInvoices((prev) => prev.filter((i) => i.invoiceNo !== invoiceNo));
  };

  const editInvoice = (inv: StoredInvoice) => {
    router.push(`/billing?edit=${inv.invoiceNo}`);
  };

  // Sort
  const sortedInvoices = [...invoices].sort((a, b) => b.createdAt - a.createdAt);

  // Customers list
  const customers = [...new Set(invoices.map((i) => i.data?.client?.name).filter(Boolean))];

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return sortedInvoices.filter((inv) => {
      const name = inv.data?.client?.name?.toLowerCase() || "";
      const invoiceNo = inv.invoiceNo.toLowerCase();

      const matchesSearch =
        invoiceNo.includes(debouncedSearch.toLowerCase()) ||
        name.includes(debouncedSearch.toLowerCase());

      const matchesCustomer =
        selectedCustomer === "" ||
        selectedCustomer === "all" ||
        inv.data?.client?.name === selectedCustomer;

      return matchesSearch && matchesCustomer;
    });
  }, [sortedInvoices, debouncedSearch, selectedCustomer]);


  // Highlight search text
  const highlight = (text: string) => {
    if (!debouncedSearch) return text;
    const parts = text.split(new RegExp(`(${debouncedSearch})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === debouncedSearch.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-1" > {part} </mark>
      ) : (
        part
      )
    );
  };

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
            <p className="text-sm text-muted-foreground">Manage drafts and billing</p>
          </div>

          <Button onClick={() => router.push("/billing")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Invoices</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{invoices.length}</CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Drafts</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{sortedInvoices.length}</CardContent>
          </Card>
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-3 flex-wrap bg-card p-4 border rounded-xl">

          <input
            className="border px-3 py-2 rounded-md text-sm w-64"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={selectedCustomer}
            onValueChange={(v) => setSelectedCustomer(v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>

              {customers.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* FILTER CHIPS */}
        <div className="flex gap-2 flex-wrap">
          {debouncedSearch && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Search: {debouncedSearch}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch("")} />
            </span>
          )}

          {selectedCustomer && selectedCustomer !== "all" && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Customer: {selectedCustomer}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCustomer("all")} />
            </span>
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
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.invoiceNo}>
                    <TableCell>{highlight(inv.invoiceNo)}</TableCell>

                    <TableCell>{highlight(inv.data?.client?.name || "N/A")}</TableCell>

                    <TableCell>{inv.data?.items?.length || 0}</TableCell>

                    <TableCell className="font-semibold">
                      ₹{calculateGrandTotal(inv).toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button size="sm" onClick={() => editInvoice(inv)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This cannot be undone.
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
