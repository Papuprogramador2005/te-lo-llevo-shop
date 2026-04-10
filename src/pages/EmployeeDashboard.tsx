import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { products, categories } from "@/data/products";
import { toast } from "sonner";
import {
  Package, Users, Truck, LogOut, Plus, Save, Trash2, Edit2,
  CheckCircle2, Clock, PackageCheck, Send,
} from "lucide-react";
import logoTL from "@/assets/logo-tl.png";

type Tab = "stock" | "proveedores" | "pedidos";

interface StockItem {
  product_id: number;
  stock_quantity: number;
  supplier_id: string | null;
}

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  category: string;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  delivery_method: string;
  payment_method: string;
  address: string | null;
  total: number;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null; phone: string | null } | null;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  despachando: { label: "Despachando", color: "bg-blue-100 text-blue-800", icon: PackageCheck },
  enviado: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Send },
  entregado: { label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
};

const statusFlow = ["pendiente", "despachando", "enviado", "entregado"];

const EmployeeDashboard = () => {
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("stock");
  const [stockData, setStockData] = useState<Record<number, StockItem>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", phone: "", category: "Frutas" });
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || (role !== "employee" && role !== "admin"))) {
      navigate("/auth");
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStock();
      fetchSuppliers();
      fetchOrders();
    }
  }, [user]);

  const fetchStock = async () => {
    const { data } = await supabase.from("product_stock").select("*");
    if (data) {
      const map: Record<number, StockItem> = {};
      data.forEach((s) => (map[s.product_id] = s));
      setStockData(map);
    }
  };

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("category");
    if (data) setSuppliers(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, profiles!orders_user_id_fkey(full_name, email, phone)")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as any);
  };

  const updateStock = async (productId: number, quantity: number) => {
    const existing = stockData[productId];
    if (existing) {
      await supabase.from("product_stock").update({ stock_quantity: quantity }).eq("product_id", productId);
    } else {
      await supabase.from("product_stock").insert({ product_id: productId, stock_quantity: quantity });
    }
    setStockData((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], product_id: productId, stock_quantity: quantity, supplier_id: prev[productId]?.supplier_id || null },
    }));
    toast.success("Stock actualizado");
  };

  const addSupplier = async () => {
    if (!newSupplier.name) return toast.error("Nombre requerido");
    const { error } = await supabase.from("suppliers").insert(newSupplier);
    if (error) return toast.error(error.message);
    toast.success("Proveedor agregado");
    setNewSupplier({ name: "", contact: "", phone: "", category: "Frutas" });
    fetchSuppliers();
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from("suppliers").delete().eq("id", id);
    toast.success("Proveedor eliminado");
    fetchSuppliers();
  };

  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    const currentIdx = statusFlow.indexOf(currentStatus);
    if (currentIdx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIdx + 1];
    const { error } = await supabase.from("orders").update({ status: nextStatus as any }).eq("id", orderId);
    if (error) return toast.error(error.message);
    toast.success(`Pedido actualizado a: ${statusLabels[nextStatus].label}`);
    fetchOrders();
  };

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const productCategories = categories.filter((c) => c !== "Todos");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Clock className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logoTL} alt="Te Lo Llevo" className="w-10 h-10" />
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground">Panel Empleado</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={18} /> Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "stock" as Tab, label: "Stock", icon: Package },
            { id: "proveedores" as Tab, label: "Proveedores", icon: Users },
            { id: "pedidos" as Tab, label: "Pedidos / Envíos", icon: Truck },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* Stock Tab */}
        {tab === "stock" && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Producto</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Categoría</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Precio</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = stockData[product.id]?.stock_quantity ?? 0;
                    return (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 flex items-center gap-2">
                          <span className="text-xl">{product.image}</span>
                          <span className="font-medium text-foreground">{product.name}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{product.category}</td>
                        <td className="p-3 text-foreground font-medium">${product.price.toFixed(2)}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setStockData((prev) => ({
                                ...prev,
                                [product.id]: { ...prev[product.id], product_id: product.id, stock_quantity: val, supplier_id: prev[product.id]?.supplier_id || null },
                              }));
                            }}
                            className="w-20 px-2 py-1 rounded border border-border bg-muted text-sm text-center"
                          />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => updateStock(product.id, stockData[product.id]?.stock_quantity ?? 0)}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Save size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Proveedores Tab */}
        {tab === "proveedores" && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-heading font-bold text-lg text-foreground">Agregar proveedor</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  placeholder="Nombre"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-muted border border-border text-sm"
                />
                <input
                  placeholder="Contacto"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-muted border border-border text-sm"
                />
                <input
                  placeholder="Teléfono"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-muted border border-border text-sm"
                />
                <select
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-muted border border-border text-sm"
                >
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addSupplier}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>

            {productCategories.map((cat) => {
              const catSuppliers = suppliers.filter((s) => s.category === cat);
              if (catSuppliers.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="font-heading font-bold text-foreground">{cat}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catSuppliers.map((s) => (
                      <div key={s.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          {s.contact && <p className="text-xs text-muted-foreground">{s.contact}</p>}
                          {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                        </div>
                        <button onClick={() => deleteSupplier(s.id)} className="text-destructive/60 hover:text-destructive">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pedidos Tab */}
        {tab === "pedidos" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck size={48} className="mx-auto mb-4 opacity-30" />
                <p>No hay pedidos aún</p>
              </div>
            ) : (
              orders.map((order) => {
                const statusInfo = statusLabels[order.status] || statusLabels.pendiente;
                const StatusIcon = statusInfo.icon;
                const canAdvance = statusFlow.indexOf(order.status) < statusFlow.length - 1;
                return (
                  <div key={order.id} className="bg-card rounded-xl border border-border p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="text-sm font-medium text-foreground">
                          {order.profiles?.full_name || order.profiles?.email || "Cliente"}
                        </p>
                        {order.profiles?.phone && (
                          <p className="text-xs text-muted-foreground">Tel: {order.profiles.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon size={14} /> {statusInfo.label}
                        </span>
                        <p className="text-lg font-bold text-primary mt-1">${Number(order.total).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>📦 Entrega: {order.delivery_method === "domicilio" ? "Domicilio" : "Recoger en tienda"}</p>
                      <p>💳 Pago: {order.payment_method}</p>
                      {order.address && <p>📍 {order.address}</p>}
                      <p>📅 {new Date(order.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>

                    {/* Status timeline */}
                    <div className="flex items-center gap-1 mt-2">
                      {statusFlow.map((s, i) => {
                        const info = statusLabels[s];
                        const currentIdx = statusFlow.indexOf(order.status);
                        const isActive = i <= currentIdx;
                        return (
                          <div key={s} className="flex items-center gap-1 flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              {i + 1}
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div className={`flex-1 h-0.5 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {canAdvance && (
                      <button
                        onClick={() => updateOrderStatus(order.id, order.status)}
                        className="w-full py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors text-sm"
                      >
                        Avanzar a: {statusLabels[statusFlow[statusFlow.indexOf(order.status) + 1]].label}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
