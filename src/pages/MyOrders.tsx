import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import CartSidebar from "@/components/CartSidebar";
import CancelOrderDialog from "@/components/CancelOrderDialog";
import EditOrderDialog from "@/components/EditOrderDialog";
import RatingDialog from "@/components/RatingDialog";
import { Package, Clock, PackageCheck, Send, CheckCircle2, ShoppingBag, ArrowLeft, X, Edit2, Star, Pause, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; message: string; color: string; icon: any; bg: string }> = {
  pendiente:   { label: "Pendiente",   message: "Compra realizada, proceso de entrega", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
  editando:    { label: "Editando",    message: "Pedido pausado: estás editando", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Pause },
  despachando: { label: "Despachando", message: "Pedido en proceso de entrega", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: PackageCheck },
  enviado:     { label: "Enviado",     message: "Producto enviado", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Send },
  entregado:   { label: "Entregado",   message: "¡Pedido entregado con éxito!", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: CheckCircle2 },
  cancelado:   { label: "Cancelado",   message: "Pedido cancelado", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: X },
};

const statusFlow = ["pendiente", "despachando", "enviado", "entregado"];

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_method: string;
  payment_method: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  cancellation_reason?: string | null;
  is_paused?: boolean;
  order_items?: { product_name: string; quantity: number; unit_price: number }[];
}

interface ReviewMap { [orderId: string]: boolean; }

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewed, setReviewed] = useState<ReviewMap>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [rateOrder, setRateOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(product_name, quantity, unit_price)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as any);

    const { data: revs } = await supabase
      .from("reviews")
      .select("order_id")
      .eq("user_id", user.id);
    if (revs) {
      const map: ReviewMap = {};
      revs.forEach((r) => { map[r.order_id] = true; });
      setReviewed(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Cliente";
  const canModify = (status: string) => status === "pendiente";

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
                const isCancelled = order.status === "cancelado";
                const isDelivered = order.status === "entregado";
                const currentIdx = statusFlow.indexOf(order.status);

                return (
                  <div key={order.id} className={`rounded-2xl border-2 p-6 space-y-4 ${config.bg}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm ${config.color}`}>
                          <StatusIcon size={24} />
                        </div>
                        <div>
                          <p className={`font-heading font-bold text-lg ${config.color}`}>{config.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Pedido #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleString("es-MX", {
                              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {canModify(order.status) && (
                          <>
                            <button
                              onClick={() => setEditOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
                            >
                              <Edit2 size={12} /> Editar
                            </button>
                            <button
                              onClick={() => setCancelOrderId(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium hover:bg-destructive/20 transition-colors"
                            >
                              <X size={12} /> Cancelar
                            </button>
                          </>
                        )}
                        {isDelivered && !reviewed[order.id] && (
                          <button
                            onClick={() => setRateOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            <Star size={12} /> Calificar
                          </button>
                        )}
                        {isDelivered && reviewed[order.id] && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle2 size={12} /> Calificado
                          </span>
                        )}
                      </div>
                    </div>

                    {isCancelled && order.cancellation_reason && (
                      <div className="bg-white/60 rounded-xl p-3 flex items-start gap-2 text-sm">
                        <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Motivo de cancelación:</p>
                          <p className="text-muted-foreground italic">"{order.cancellation_reason}"</p>
                        </div>
                      </div>
                    )}

                    {!isCancelled && (
                      <div className="flex items-center gap-0 py-2">
                        {statusFlow.map((s, i) => {
                          const sConfig = statusConfig[s];
                          const SIcon = sConfig.icon;
                          const isActive = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={s} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isCurrent ? "bg-primary text-primary-foreground scale-110 shadow-md"
                                  : isActive ? "bg-primary/70 text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                                }`}>
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
                    )}

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

      {cancelOrderId && (
        <CancelOrderDialog
          open={!!cancelOrderId}
          onOpenChange={(v) => !v && setCancelOrderId(null)}
          orderId={cancelOrderId}
          userId={user.id}
          onCancelled={fetchOrders}
        />
      )}
      {editOrder && (
        <EditOrderDialog
          open={!!editOrder}
          onOpenChange={(v) => !v && setEditOrder(null)}
          orderId={editOrder.id}
          initialAddress={editOrder.address}
          initialNotes={editOrder.notes}
          onSaved={fetchOrders}
        />
      )}
      {rateOrder && (
        <RatingDialog
          open={!!rateOrder}
          onOpenChange={(v) => !v && setRateOrder(null)}
          orderId={rateOrder.id}
          userId={user.id}
          userName={userName}
          onSubmitted={fetchOrders}
        />
      )}
    </div>
  );
};

export default MyOrders;
