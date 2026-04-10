import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import CartSidebar from "@/components/CartSidebar";
import { Package, Clock, PackageCheck, Send, CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";

const statusConfig: Record<string, { label: string; message: string; color: string; icon: any; bg: string }> = {
  pendiente: {
    label: "Pendiente",
    message: "Compra realizada, proceso de entrega",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  despachando: {
    label: "Despachando",
    message: "Pedido en proceso de entrega",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: PackageCheck,
  },
  enviado: {
    label: "Enviado",
    message: "Producto enviado",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    icon: Send,
  },
  entregado: {
    label: "Entregado",
    message: "¡Pedido entregado con éxito!",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle2,
  },
};

const statusFlow = ["pendiente", "despachando", "enviado", "entregado"];

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_method: string;
  payment_method: string;
  created_at: string;
  order_items?: { product_name: string; quantity: number; unit_price: number }[];
}

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(product_name, quantity, unit_price)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as any);
    setLoading(false);
  };

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-orders")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader searchQuery="" onSearchChange={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Package size={64} className="mx-auto text-muted-foreground/30" />
            <h2 className="font-heading text-2xl font-bold text-foreground">Inicia sesión para ver tus pedidos</h2>
            <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full">
              Iniciar sesión
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={16} /> Volver a la tienda
          </Link>

          <h1 className="font-heading text-3xl font-extrabold text-foreground mb-8">Mis Pedidos</h1>

          {loading ? (
            <div className="text-center py-12"><Clock className="animate-spin mx-auto text-primary" size={32} /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <ShoppingBag size={64} className="mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">Aún no tienes pedidos</p>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full">
                Ir a comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pendiente;
                const StatusIcon = config.icon;
                const currentIdx = statusFlow.indexOf(order.status);

                return (
                  <div key={order.id} className={`rounded-2xl border-2 p-6 space-y-4 ${config.bg}`}>
                    {/* Status message */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm ${config.color}`}>
                        <StatusIcon size={24} />
                      </div>
                      <div>
                        <p className={`font-heading font-bold text-lg ${config.color}`}>{config.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Pedido #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString("es-MX", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-0 py-2">
                      {statusFlow.map((s, i) => {
                        const sConfig = statusConfig[s];
                        const SIcon = sConfig.icon;
                        const isActive = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div key={s} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground scale-110 shadow-md"
                                    : isActive
                                    ? "bg-primary/70 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <SIcon size={14} />
                              </div>
                              <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                {sConfig.label}
                              </span>
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Order items */}
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="bg-white/60 rounded-xl p-4 space-y-2">
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.product_name} x{item.quantity}</span>
                            <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold text-foreground">
                          <span>Total</span>
                          <span className="text-primary">${Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
      <CartSidebar />
    </div>
  );
};

export default MyOrders;
