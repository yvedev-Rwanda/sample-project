import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { type Supplier } from "@/lib/storage";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Search, Truck, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/suppliers")({ component: SuppliersPage });

const empty: any = { id: undefined, name: "", contact: "", email: "", address: "" };

function SuppliersPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await api.get("/suppliers");
      setList(data);
    } catch (e) {
      toast.error("Could not fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contact.toLowerCase().includes(search.toLowerCase()),
    );
  }, [list, search]);

  const edit = (s: any) => {
    setForm({ ...s });
    setOpen(true);
  };

  const remove = async (id: any) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier removed from database");
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/suppliers/${form.id}`, form);
        toast.success("Supplier information updated!");
      } else {
        await api.post("/suppliers", form);
        toast.success("New supplier added successfully!");
      }
      setOpen(false);
      setForm(empty);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your inventory suppliers.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg" style={{ background: "var(--gradient-primary)" }}>
              <Truck className="size-4 mr-2" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Supplier Company" : "New Supplier Registration"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sname">Company Name</Label>
                <Input id="sname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Phone</Label>
                <Input id="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semail">Email Address</Label>
                <Input id="semail" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saddress">Address</Label>
                <Input id="saddress" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button type="submit" className="w-full mt-4" style={{ background: "var(--gradient-primary)" }}>
                {form.id ? "Update Supplier" : "Save Supplier"}
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
              placeholder="Search suppliers..."
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
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Address</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="size-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No suppliers found.</TableCell></TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell>{s.contact}</TableCell>
                    <TableCell>{s.email || "---"}</TableCell>
                    <TableCell>{s.address || "---"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 px-2">
                        <Button variant="ghost" size="icon" className="size-8 text-blue-600" onClick={() => edit(s)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-red-600" onClick={() => remove(s.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
