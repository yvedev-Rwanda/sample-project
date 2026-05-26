import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { type Supplier } from "@/lib/storage";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Search, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/suppliers")({ component: SuppliersPage });

const empty = { name: "", contact: "", email: "", address: "" };

function SuppliersPage() {
  const [list, setList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await api.get("/suppliers");
      setList(data);
    } catch (e) {
      toast.error("Could not fetch suppliers from database");
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
        s.contact?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [list, search]);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({ name: s.name, contact: s.contact || "", email: s.email || "", address: s.address || "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        toast.info("Update logic not implemented on server");
      } else {
        await api.post("/suppliers", form);
        toast.success("New supplier saved to database!");
      }
      setOpen(false);
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
          <p className="text-muted-foreground">Manage your cooperative's source of products.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="shadow-lg" style={{ background: "var(--gradient-primary)" }}>
              <Truck className="size-4 mr-2" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Supplier Info" : "Register New Supplier"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sname">Supplier Name</Label>
                <Input id="sname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Enter name..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person / Phone</Label>
                <Input id="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="07xxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semail">Email Address</Label>
                <Input id="semail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@supplier.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saddress">Business Address</Label>
                <Input id="saddress" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Location..." />
              </div>
              <Button type="submit" className="w-full mt-4" style={{ background: "var(--gradient-primary)" }}>
                {editing ? "Update Info" : "Save to Database"}
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
                <TableHead className="text-right font-bold px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="size-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    {search ? "No matches found." : "No suppliers found in database."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell>{s.contact || "---"}</TableCell>
                    <TableCell>{s.email || "---"}</TableCell>
                    <TableCell>{s.address || "---"}</TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(s)}
                          className="hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => toast.info("Delete not implemented")}
                        >
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
