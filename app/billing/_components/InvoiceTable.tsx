"use client";

import { useBillingStore } from "@/store/useBillingStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";

export default function InvoiceTable() {
  const items = useBillingStore((s: any) => s.items);
  const deleteItem = useBillingStore((s: any) => s.deleteItem);
  const editItem = useBillingStore((s: any) => s.editItem);

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>S.No</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item: any, i: number) => (
            <TableRow key={item.id} className={`hover:bg-muted/50 transition ${item?.id === useBillingStore.getState().tempItem.id ? "bg-muted" : "" } `}>
              <TableCell>{i + 1}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.qty}</TableCell>
              <TableCell>₹{item.price}</TableCell>
              <TableCell className="font-semibold">
                ₹{item.qty * item.price}
              </TableCell>

              {/* ACTION BUTTONS */}
              <TableCell className="text-right space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => editItem(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
