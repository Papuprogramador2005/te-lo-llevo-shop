import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { rateLimit, rateLimitMessage } from "@/lib/rateLimit";

const reasonSchema = z.string().trim().min(5, "Indica un motivo (mín. 5 caracteres)").max(300, "Máximo 300 caracteres");

const PRESET_REASONS = [
  "Cambié de opinión",
  "Encontré un mejor precio",
  "El tiempo de entrega es muy largo",
  "Me equivoqué al hacer el pedido",
  "Problema con el método de pago",
  "Otro motivo",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderId: string;
  userId: string;
  onCancelled?: () => void;
}

const CancelOrderDialog = ({ open, onOpenChange, orderId, userId, onCancelled }: Props) => {
  const [preset, setPreset] = useState<string>("");
  const [custom, setCustom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!rateLimit(`cancel-${userId}`, 5, 60_000)) {
      toast.error(rateLimitMessage(60));
      return;
    }
    const reason = preset === "Otro motivo" || !preset ? custom : preset;
    const parsed = reasonSchema.safeParse(reason);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("orders")
      .update({
        status: "cancelado" as any,
        cancellation_reason: parsed.data,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Pedido cancelado correctamente");
    onCancelled?.();
    onOpenChange(false);
    setPreset(""); setCustom("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X size={20} className="text-destructive" /> Cancelar pedido
          </DialogTitle>
          <DialogDescription>
            Por favor indícanos el motivo de la cancelación. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {PRESET_REASONS.map((r) => (
            <label key={r} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${preset === r ? "border-destructive bg-destructive/5" : "border-border hover:border-destructive/30"}`}>
              <input
                type="radio"
                name="reason"
                value={r}
                checked={preset === r}
                onChange={() => setPreset(r)}
                className="accent-destructive"
              />
              <span className="text-sm text-foreground">{r}</span>
            </label>
          ))}
        </div>

        {(preset === "Otro motivo" || !preset) && (
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Describe el motivo..."
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-destructive/30 text-sm resize-none"
          />
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 bg-muted text-foreground font-medium rounded-full hover:bg-muted/80 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Confirmar cancelación
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderDialog;
