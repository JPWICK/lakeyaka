import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatJPY } from "@/lib/format";
import { resolveImage } from "@/lib/images";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price_jpy: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  view_count: number;
};

const empty = {
  name: "",
  description: "",
  price_jpy: 0,
  stock: 0,
  image_url: "",
  category: "",
  is_active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });

  useEffect(() => {
    document.title = "Inventory — Admin";
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data ?? []);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price_jpy: p.price_jpy,
      stock: p.stock,
      image_url: p.image_url ?? "",
      category: p.category ?? "",
      is_active: p.is_active,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price_jpy: Math.max(0, Math.floor(Number(form.price_jpy) || 0)),
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      image_url: form.image_url.trim() || null,
      category: form.category.trim() || null,
      is_active: form.is_active,
    };

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    if (error) toast.error(error.message);
    else {
      toast.success(editing ? "Product updated" : "Product added");
      setOpen(false);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Inventory</h1>
          <p className="text-muted-foreground mt-1">Add masks, edit prices, and update stock.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add mask</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Mask</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price (JPY)</th>
                <th className="p-3 font-medium">Stock</th>
                <th className="p-3 font-medium">Views</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={resolveImage(p.image_url)} alt="" className="h-12 w-12 rounded object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category ?? "—"}</td>
                  <td className="p-3 font-semibold">{formatJPY(p.price_jpy)}</td>
                  <td className="p-3">
                    <span className={p.stock <= 3 ? "text-destructive font-medium" : ""}>{p.stock}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.view_count}</td>
                  <td className="p-3">
                    <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Hidden"}</Badge>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "Edit mask" : "Add mask"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (JPY)</Label>
                <Input id="price" type="number" min={0} value={form.price_jpy}
                  onChange={(e) => setForm({ ...form, price_jpy: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min={0} value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cat">Category</Label>
                <Input id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Raksha / Sanni / Kolam" />
              </div>
              <div>
                <Label htmlFor="img">Image (slug or URL)</Label>
                <Input id="img" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="mask-naga or https://..." />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <Label htmlFor="active">Visible on storefront</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Add mask"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
