import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { products, categories } from "@/data/products";
import { toast } from "sonner";
import {
  Package, Users, Truck, LogOut, Plus, Save, Trash2, ShieldCheck,
  CheckCircle2, Clock, PackageCheck, Send, X, Pause, AlertCircle, ChevronRight,
} from "lucide-react";
import logoTL from "@/assets/logo-tl.png";

type Tab = "stock" | "proveedores" | "pedidos";

interface StockItem { product_id: number; stock_quantity: number; supplier_id: string | null; }
interface Supplier { id: string; name: string; contact: string | null; phone: string | null; category: string; }
interface Order {
  id: string; user_id: string; status: string;
  delivery_method: string; payment_method: string;
  address: string | null; notes: string | null;
  total: number; created_at: string;
  cancellation_reason: string | null; is_paused: boolean;
  cancelled_at: string | null;
  profiles?: { full_name: string | null; email: string | null; phone: string | null } | null;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  pendiente:   { label: "Pendiente",   color: "bg-yellow-100 text-yellow-800",  icon: Clock },
  editando:    { label: "Pausado (editando)", color: "bg-orange-100 text-orange-800", icon: Pause },
  despachando: { label: "Despachando", color: "bg-blue-100 text-blue-800",       icon: PackageCheck },
  enviado:     { label: "Enviado",     color: "bg-purple-100 text-purple-800",   icon: Send },
  entregado:   { label: "Entregado",   color: "bg-green-100 text-green-800",     icon: CheckCircle2 },
  cancelado:   { label: "Cancelado",   color: "bg-red-100 text-red-800",         icon: X },
};

const statusFlow = ["pendiente", "despachando", "enviado", "entregado"];

const EmployeeDashboard = () => {
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("pedidos");
  const [stockData, setStockData] = useState<Record<number, StockItem>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", phone: "", category: "Frutas" });

  useEffect(() => {
    if (!loading && (!user || (role !== "employee" && role !== "admin"))) navigate("/auth");
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStock();
      fetchSuppliers();
      fetchOrders();
      const channel = supabase
        .channel("emp-orders")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
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

  // FIFO: oldest first (first in, first out)
  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, profiles!orders_user_id_fkey(full_name, email, phone)")
      .order("created_at", { ascending: true });
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
    toast.success(`Pedido → ${statusLabels[nextStatus].label}`);
    fetchOrders();
  };

  const filteredProducts = selectedCategory === "Todos" ? products : products.filter((p) => p.category === selectedCategory);
  const productCategories = categories.filter((c) => c !== "Todos");

  // Pedidos activos (FIFO): no cancelados ni entregados; pausados al final
  const activeOrders = orders.filter((o) => o.status !== "entregado" && o.status !== "cancelado");
  const pausedOrders = activeOrders.filter((o) => o.is_paused || o.status === "editando");
  const liveOrders = activeOrders.filter((o) => !o.is_paused && o.status !== "editando");
  const finishedOrders = orders.filter((o) => o.status === "entregado" || o.status === "cancelado").reverse();

  const stats = {
    pending: orders.filter((o) => o.status === "pendiente").length,
    inProgress: orders.filter((o) => o.status === "despachando" || o.status === "enviado").length,
    delivered: orders.filter((o) => o.status === "entregado").length,
    cancelled: orders.filter((o) => o.status === "cancelado").length,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Clock className="animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logoTL} alt="Te Lo Llevo" className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1">
                <ShieldCheck size={10} className="text-secondary-foreground" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-lg text-white">Panel Administrativo</h1>
                <span className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-bold">ADMIN</span>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={18} /> Salir
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Pendientes (FIFO)", value: stats.pending, color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
            { label: "En curso", value: stats.inProgress, color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
            { label: "Entregados", value: stats.delivered, color: "bg-green-500/10 border-green-500/30 text-green-400" },
            { label: "Cancelados", value: stats.cancelled, color: "bg-red-500/10 border-red-500/30 text-red-400" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-xs uppercase tracking-wider opacity-80">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "pedidos" as Tab, label: "Pedidos / Envíos", icon: Truck },
            { id: "stock" as Tab, label: "Stock", icon: Package },
            { id: "proveedores" as Tab, label: "Proveedores", icon: Users },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-secondary text-secondary-foreground shadow-md" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* PEDIDOS TAB */}
        {tab === "pedidos" && (
          <div className="space-y-6">
            {/* Cola FIFO activa */}
            <div>
              <h3 className="font-heading font-bold text-white mb-3 flex items-center gap-2">
                <ChevronRight size={18} className="text-secondary" />
                Cola de despacho (FIFO – primero en entrar, primero en salir)
              </h3>
              {liveOrders.length === 0 ? (
                <p className="text-sm text-slate-400 bg-slate-800/50 rounded-xl p-6 text-center">No hay pedidos activos</p>
              ) : (
                <div className="space-y-3">
                  {liveOrders.map((order, idx) => {
                    const info = statusLabels[order.status];
                    const StatusIcon = info.icon;
                    const canAdvance = statusFlow.indexOf(order.status) < statusFlow.length - 1;
                    return (
                      <div key={order.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">#{order.id.slice(0, 8)}</p>
                              <p className="text-sm font-medium text-white">{order.profiles?.full_name || order.profiles?.email || "Cliente"}</p>
                              {order.profiles?.phone && <p className="text-xs text-slate-400">📞 {order.profiles.phone}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>
                              <StatusIcon size={12} /> {info.label}
                            </span>
                            <p className="text-lg font-bold text-secondary mt-1">${Number(order.total).toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 space-y-1 bg-slate-900/50 p-2 rounded">
                          <p>📦 {order.delivery_method === "domicilio" ? "Domicilio" : "Recoger en tienda"} • 💳 {order.payment_method}</p>
                          {order.address && <p>📍 {order.address}</p>}
                          <p>📅 {new Date(order.created_at).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>

                        {canAdvance && (
                          <button
                            onClick={() => updateOrderStatus(order.id, order.status)}
                            className="w-full py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
                          >
                            Avanzar a: {statusLabels[statusFlow[statusFlow.indexOf(order.status) + 1]].label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pausados */}
            {pausedOrders.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-orange-400 mb-3 flex items-center gap-2">
                  <Pause size={18} /> Pedidos pausados (cliente está editando)
                </h3>
                <div className="space-y-2">
                  {pausedOrders.map((order) => (
                    <div key={order.id} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">#{order.id.slice(0, 8)} – {order.profiles?.full_name || "Cliente"}</p>
                        <p className="text-xs text-orange-300">⏸ Pausado: el cliente está editando este pedido. Continuará automáticamente al guardar.</p>
                      </div>
                      <span className="text-sm font-bold text-orange-400">${Number(order.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico */}
            {finishedOrders.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-slate-400 mb-3">Histórico</h3>
                <div className="space-y-2">
                  {finishedOrders.slice(0, 10).map((order) => {
                    const info = statusLabels[order.status];
                    const StatusIcon = info.icon;
                    return (
                      <div key={order.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${info.color}`}>
                              <StatusIcon size={10} /> {info.label}
                            </span>
                            <p className="text-sm text-white">#{order.id.slice(0, 8)} – {order.profiles?.full_name || "Cliente"}</p>
                          </div>
                          <span className="text-sm font-bold text-slate-300">${Number(order.total).toFixed(2)}</span>
                        </div>
                        {order.status === "cancelado" && order.cancellation_reason && (
                          <div className="mt-2 flex items-start gap-2 text-xs text-red-300 bg-red-500/10 p-2 rounded">
                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                            <span>Motivo: "{order.cancellation_reason}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STOCK TAB */}
        {tab === "stock" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategory === cat ? "bg-secondary text-secondary-foreground" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left p-3 font-medium text-slate-400">Producto</th>
                    <th className="text-left p-3 font-medium text-slate-400">Categoría</th>
                    <th className="text-left p-3 font-medium text-slate-400">Precio</th>
                    <th className="text-left p-3 font-medium text-slate-400">Stock</th>
                    <th className="text-left p-3 font-medium text-slate-400">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = stockData[product.id]?.stock_quantity ?? 0;
                    return (
                      <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-3 flex items-center gap-2">
                          <span className="text-xl">{product.image}</span>
                          <span className="font-medium text-white">{product.name}</span>
                        </td>
                        <td className="p-3 text-slate-400">{product.category}</td>
                        <td className="p-3 text-white font-medium">${product.price.toFixed(2)}</td>
                        <td className="p-3">
                          <input
                            type="number" min="0" value={stock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setStockData((prev) => ({
                                ...prev,
                                [product.id]: { ...prev[product.id], product_id: product.id, stock_quantity: val, supplier_id: prev[product.id]?.supplier_id || null },
                              }));
                            }}
                            className="w-20 px-2 py-1 rounded border border-slate-600 bg-slate-900 text-white text-sm text-center"
                          />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => updateStock(product.id, stockData[product.id]?.stock_quantity ?? 0)}
                            className="p-1.5 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
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

        {/* PROVEEDORES TAB */}
        {tab === "proveedores" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Agregar proveedor</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input placeholder="Nombre" value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-white" />
                <input placeholder="Contacto" value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-white" />
                <input placeholder="Teléfono" value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-white" />
                <select value={newSupplier.category}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-white">
                  {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={addSupplier} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus size={16} /> Agregar
              </button>
            </div>

            {productCategories.map((cat) => {
              const catSuppliers = suppliers.filter((s) => s.category === cat);
              if (catSuppliers.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="font-heading font-bold text-white">{cat}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catSuppliers.map((s) => (
                      <div key={s.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white">{s.name}</p>
                          {s.contact && <p className="text-xs text-slate-400">{s.contact}</p>}
                          {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                        </div>
                        <button onClick={() => deleteSupplier(s.id)} className="text-red-400/60 hover:text-red-400">
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
      </div>
    </div>
  );
};

export default EmployeeDashboard;
