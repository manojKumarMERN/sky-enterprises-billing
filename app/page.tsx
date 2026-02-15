"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, PlusCircle, X, Eye, Search, TrendingUp, FileText, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { amountInWords } from "@/lib/utils";

interface StoredInvoice {
  invoiceNo: string;
  createdAt: number;
  expiryTime: number;
  data: {
    client: { name: string; address: string; phone: string };
    items: any[];
    totals?: {
      subTotal: number;
      grandTotal: number;
      discountPercent: number;
      discountFlat: number;
    };
    discountPercent?: number;
    discountFlat?: number;
    company?: string;
    tagLine?: string;
    location?: string;
    phone?: string;
    projectDescriptionEnabled?: boolean;
    projectDescription?: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const list = Object.keys(localStorage)
      .filter((k) => k.startsWith("invoice_"))
      .map((k) => {
        try { return JSON.parse(localStorage.getItem(k) || "{}"); }
        catch { return null; }
      })
      .filter(Boolean);
    setInvoices(list);
    setLoading(false);
  }, []);

  // ── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const calculateGrandTotal = (inv: StoredInvoice): number => {
    if (inv.data?.totals?.grandTotal != null) return inv.data.totals.grandTotal;
    const items = inv.data?.items || [];
    const dp = inv.data?.discountPercent || 0;
    const df = inv.data?.discountFlat || 0;
    const sub = items.reduce((sum: number, item: any) => {
      if (item.sqft && item.rate) return sum + item.qty * item.sqft * item.rate;
      return sum + item.qty * item.price;
    }, 0);
    return sub - (sub * dp) / 100 - df;
  };

  const deleteInvoice = (invoiceNo: string) => {
    localStorage.removeItem(`invoice_${invoiceNo}`);
    setInvoices((prev) => prev.filter((i) => i.invoiceNo !== invoiceNo));
  };

  const editInvoice = (inv: StoredInvoice) =>
    router.push(`/billing?edit=${inv.invoiceNo}`);

  const viewInvoice = (inv: StoredInvoice) => {
    const totals = inv.data?.totals;
    const subTotal = totals?.subTotal ?? calculateGrandTotal(inv);
    const grandTotal = totals?.grandTotal ?? calculateGrandTotal(inv);
    const discountPercent = totals?.discountPercent ?? inv.data?.discountPercent ?? 0;
    sessionStorage.setItem("invoice_preview", JSON.stringify({
      data: inv.data,
      invoiceNo: inv.invoiceNo,
      date: new Date(inv.createdAt).toLocaleDateString("en-IN"),
      day: new Date(inv.createdAt).toLocaleString("en-IN", { weekday: "long" }),
      subTotal,
      percentDiscountAmount: (subTotal * discountPercent) / 100,
      grandTotal,
      amountWords: amountInWords(grandTotal),
    }));
    window.open("/invoice-preview", "_blank", "width=1000,height=800");
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const sortedInvoices = useMemo(
    () => [...invoices].sort((a, b) => b.createdAt - a.createdAt),
    [invoices]
  );

  const customers = useMemo(
    () => [...new Set(invoices.map((i) => i.data?.client?.name).filter(Boolean))],
    [invoices]
  );

  const filteredInvoices = useMemo(() => {
    return sortedInvoices.filter((inv) => {
      const name = inv.data?.client?.name?.toLowerCase() || "";
      const no = inv.invoiceNo.toLowerCase();
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q || no.includes(q) || name.includes(q);
      const matchCustomer = selectedCustomer === "all" || inv.data?.client?.name === selectedCustomer;
      return matchSearch && matchCustomer;
    });
  }, [sortedInvoices, debouncedSearch, selectedCustomer]);

  const highlight = (text: string) => {
    if (!debouncedSearch) return <>{text}</>;
    const parts = text.split(new RegExp(`(${debouncedSearch})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === debouncedSearch.toLowerCase()
            ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white rounded-sm px-0.5">{part}</mark>
            : part
        )}
      </>
    );
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + calculateGrandTotal(inv), 0);
  const hasFilters = debouncedSearch || selectedCustomer !== "all";

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">

        {/* ── TOP NAV ── */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight">SKY Enterprises</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Invoice Management System</p>
            </div>
            <Button onClick={() => router.push("/billing")} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

          {/* ── PAGE TITLE ── */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-sm mt-1">Track, manage and generate invoices</p>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading
                  ? <Skeleton className="h-8 w-16" />
                  : <p className="text-3xl font-bold">{invoices.length}</p>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading
                  ? <Skeleton className="h-8 w-32" />
                  : <p className="text-3xl font-bold text-green-600">
                      ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading
                  ? <Skeleton className="h-8 w-12" />
                  : <p className="text-3xl font-bold">{customers.length}</p>
                }
              </CardContent>
            </Card>
          </div>

          {/* ── FILTERS ── */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9 pr-9"
                    placeholder="Search invoice or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <Button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearch("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Customer filter */}
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <Separator className="my-1" />
                    {customers.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {debouncedSearch && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                      Search: {debouncedSearch}
                      <Button onClick={() => setSearch("")} className="ml-1 rounded hover:bg-muted">
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedCustomer !== "all" && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                      {selectedCustomer}
                      <Button onClick={() => setSelectedCustomer("all")} className="ml-1 rounded hover:bg-muted">
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── DESKTOP TABLE ── */}
          <Card className="hidden md:block">
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

                {/* Skeleton */}
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Empty */}
                {!loading && filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">
                        {invoices.length === 0 ? "No invoices yet" : "No results found"}
                      </p>
                      <p className="text-sm mt-1">
                        {invoices.length === 0
                          ? "Create your first invoice to get started"
                          : "Try adjusting your search or filter"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}

                {/* Rows */}
                {!loading && filteredInvoices.map((inv) => (
                  <TableRow key={inv.invoiceNo}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {highlight(inv.invoiceNo)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {highlight(inv.data?.client?.name || "N/A")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {inv.data?.items?.length || 0} item{(inv.data?.items?.length || 0) !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ₹{calculateGrandTotal(inv).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => viewInvoice(inv)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Invoice</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => editInvoice(inv)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Invoice</TooltipContent>
                        </Tooltip>

                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Delete Invoice</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Invoice <strong>{inv.invoiceNo}</strong> for <strong>{inv.data?.client?.name}</strong> will be permanently deleted. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteInvoice(inv.invoiceNo)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* ── MOBILE CARDS ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}

            {!loading && filteredInvoices.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    {invoices.length === 0 ? "No invoices yet" : "No results found"}
                  </p>
                  <p className="text-sm mt-1">
                    {invoices.length === 0 ? "Tap + New to get started" : "Try a different search"}
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && filteredInvoices.map((inv) => (
              <Card key={inv.invoiceNo} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-muted-foreground truncate">{inv.invoiceNo}</p>
                      <p className="font-semibold text-base truncate mt-0.5">{inv.data?.client?.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{inv.data?.client?.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-green-600">
                        ₹{calculateGrandTotal(inv).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Badge row */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {inv.data?.items?.length || 0} item{(inv.data?.items?.length || 0) !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <Separator className="mb-3" />

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => viewInvoice(inv)}>
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => editInvoice(inv)}>
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Invoice <strong>{inv.invoiceNo}</strong> for <strong>{inv.data?.client?.name}</strong> will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => deleteInvoice(inv.invoiceNo)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── FOOTER COUNT ── */}
          {!loading && invoices.length > 0 && (
            <p className="text-sm text-muted-foreground text-right">
              Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          )}

        </main>
      </div>
    </TooltipProvider>
  );
}