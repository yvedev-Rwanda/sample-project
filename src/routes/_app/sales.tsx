import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { type Sale, type Customer, type Product } from "@/lib/storage";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, ShoppingBag, CheckCircle2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sales")({ component: SalesPage });

function ReceiptModal({ sale, customerName, items, onClose }: { sale: any, customerName: string, items: any[], onClose: () => void }) {
  const print = () => window.print();

  return (
    <Dialog open={!!sale} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white text-black">
        <div id="printable-receipt" className="p-8 space-y-6 text-black font-sans print:p-0">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold uppercase tracking-tight">Tuzamurane Cooperative</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sales Information Management</p>
            <div className="h-px bg-border my-4" />
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span>Receipt No:</span><span className="font-mono">#{sale.id}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{new Date(sale.date).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Cashier:</span><span>{sale.cashier_name}</span></div>
          </div>

          <div className="border-y py-4 space-y-2">
            <div className="flex justify-between text-sm font-bold border-b pb-1">
              <span>Item</span>
              <span>Total</span>
            </div>
            {items.length > 0 ? items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{item.product_name} x {item.quantity}</span>
                <span>{(item.quantity * item.unit_price).toLocaleString()} RWF</span>
              </div>
            )) : (
                <div className="flex justify-between text-xs">
                <span>Transaction Total</span>
                <span>{Number(sale.total_amount).toLocaleString()} RWF</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end border-t pt-4">
            <span className="text-sm font-bold uppercase">Grand Total</span>
            <span className="text-xl font-black">{Number(sale.total_amount)?.toLocaleString()} RWF</span>
          </div>

          <div className="text-center pt-6 space-y-2">
            <p className="text-[10px] text-muted-foreground italic">Thank you for shopping with Tuzamurane!</p>
            <div className="flex justify-center">
              <CheckCircle2 className="size-8 text-emerald-500 opacity-20" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-muted/30 border-t flex gap-2 justify-end print:hidden">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={print} style={{ background: "var(--gradient-primary)" }}>
            <Printer className="size-4 mr-2" /> Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SalesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1 });
  const [receiptSale, setReceiptSale] = useState<any | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const [sData, cData, pData] = await Promise.all([
        api.get("/sales"),
        api.get("/customers"),
        api.get("/products"),
      ]);
      setList(sData);
      setCustomers(cData);
      setProducts(pData);
    } catch (e) {
      toast.error("Could not fetch sales records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id.toString(), p])), [products]);

  const filtered = useMemo(() => {
    return list.filter(s => {
      const c = s.customer_name?.toLowerCase() ?? "";
      return c.includes(search.toLowerCase());
    });
  }, [list, search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = productMap.get(form.productId);
    if (!p) return toast.error("Please select a product");
    if (p.stock < form.quantity) return toast.error("Insufficient stock");

    try {
      const payload = {
        customer_id: Number(form.customerId),
        items: [
          {
            product_id: Number(form.productId),
            quantity: form.quantity,
            unit_price: p.price
          }
        ]
      };

      await api.post("/sales", payload);
      toast.success("Sale recorded successfully!");
      setOpen(false);
      setForm({ customerId: "", productId: "", quantity: 1 });
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record and track cooperative sales transactions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)} className="shadow-lg" style={{ background: "var(--gradient-primary)" }}>
              <ShoppingBag className="size-4 mr-2" /> Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} ({p.stock} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  required
                  className="h-11"
                />
              </div>
              {form.productId && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span className="font-semibold">{productMap.get(form.productId)?.price.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between mt-1 border-t pt-1">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-primary">
                      {((productMap.get(form.productId)?.price ?? 0) * form.quantity).toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full h-11 mt-2" style={{ background: "var(--gradient-primary)" }}>
                Save Sale & Generate Receipt
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 text-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">Total Amount</TableHead>
                <TableHead className="font-bold">Cashier</TableHead>
                <TableHead className="text-right font-bold px-6">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="size-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    No sales records found in database.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(s.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">{s.customer_name || "Guest"}</TableCell>
                    <TableCell className="font-bold text-primary">{Number(s.total_amount).toLocaleString()} RWF</TableCell>
                    <TableCell>{s.cashier_name}</TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setReceiptSale(s)}
                        className="hover:text-primary hover:bg-primary/10"
                      >
                        <Printer className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          customerName={receiptSale.customer_name || "Guest"}
          items={[]} 
          onClose={() => setReceiptSale(null)}
        />
      )}
    </div>
  );
}
