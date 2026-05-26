import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileBarChart, PieChart, History, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/detailed");
      setData(res);
    } catch (e) {
      toast.error("Could not fetch report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const revenue = data.reduce((s, x) => s + Number(x.subtotal), 0);
    const itemsSold = data.reduce((s, x) => s + Number(x.quantity), 0);
    
    const byProduct = new Map<string, number>();
    for (const item of data) {
      byProduct.set(item.product_name, (byProduct.get(item.product_name) ?? 0) + Number(item.subtotal));
    }

    return { revenue, itemsSold, byProduct: [...byProduct.entries()] };
  }, [data]);

  function exportCSV() {
    if (data.length === 0) return toast.error("No data to export");
    const rows = [
      ["Date", "Customer", "Product", "Qty", "Unit Price", "Total", "Cashier"],
      ...data.map((s) => [
        new Date(s.date).toISOString(),
        s.customer_name || "Guest",
        s.product_name,
        s.quantity,
        s.unit_price,
        s.subtotal,
        s.cashier_name,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tuzamurane-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  }

  if (loading) return <div className="flex flex-col items-center justify-center h-64 gap-3"><Loader2 className="animate-spin text-primary" /><p className="text-sm text-muted-foreground">Generating Professional Report...</p></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analysis</h1>
          <p className="text-muted-foreground">Detailed financial reports and transaction history.</p>
        </div>
        <Button onClick={exportCSV} className="shadow-lg" style={{ background: "var(--gradient-primary)" }}>
          <Download className="size-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="size-16" /></div>
           <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest font-bold opacity-80">Total Revenue</CardTitle></CardHeader>
           <CardContent><div className="text-3xl font-black">{stats.revenue.toLocaleString()} RWF</div></CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-orange-500 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10"><PieChart className="size-16" /></div>
           <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest font-bold opacity-80">Units Sold</CardTitle></CardHeader>
           <CardContent><div className="text-3xl font-black">{stats.itemsSold} units</div></CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-indigo-600 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10"><History className="size-16" /></div>
           <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest font-bold opacity-80">Total Invoices</CardTitle></CardHeader>
           <CardContent><div className="text-3xl font-black">{data.length} records</div></CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-0 shadow-xl">
          <CardHeader className="border-b bg-muted/20">
             <CardTitle className="text-base flex items-center gap-2"><PieChart className="size-4 text-primary" /> Revenue by Product</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[11px] font-bold">Product</TableHead>
                  <TableHead className="text-right text-[11px] font-bold">Total (RWF)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byProduct.map(([name, total]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium text-sm">{name}</TableCell>
                    <TableCell className="text-right font-bold text-sm">{total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {stats.byProduct.length === 0 && <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">No data</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-xl">
          <CardHeader className="border-b bg-muted/20">
             <CardTitle className="text-base flex items-center gap-2"><History className="size-4 text-primary" /> Transaction Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30 text-[11px] font-bold">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {data.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{new Date(s.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{s.customer_name || "Guest"}</TableCell>
                    <TableCell>{s.product_name} <span className="text-[10px] text-muted-foreground">x{s.quantity}</span></TableCell>
                    <TableCell className="text-right font-bold">{Number(s.subtotal).toLocaleString()} RWF</TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No sales records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
