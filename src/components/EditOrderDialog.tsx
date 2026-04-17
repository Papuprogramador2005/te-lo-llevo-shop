import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Edit2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const editSchema = z.object({
  address: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
  notes: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderId: string;
  initialAddress: string | null;
  initialNotes: string | null;
  onSaved?: () => void;
}

const EditOrderDialog = ({ open, onOpenChange, orderId, initialAddress, initialNotes, onSaved }: Props) => {
  const [address, setAddress] = useState(initialAddress || "");
  const [notes, setNotes] = useState(initialNotes || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAddress(initialAddress || "");
      setNotes(initialNotes || "");
      // Pause the order while editing
      supabase.from("orders").update({ is_paused: true, status: "editando" as any }).eq("id", orderId);
    }
  }, [open, initialAddress, initialNotes, orderId]);

  const handleSave = async () => {
    const parsed = editSchema.safeParse({ address, notes });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("orders")
      .update({
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
        is_paused: false,
        status: "pendiente" as any,
      })
      .eq("id", orderId);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Pedido actualizado. Continúa la gestión.");
    onSaved?.();
    onOpenChange(false);
  };

  const handleCancel = async () => {
    // Resume order without saving changes
    await supabase.from("orders").update({ is_paused: false, status: "pendiente" as any }).eq("id", orderId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); else onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 size={20} className="text-primary" /> Editar pedido
          </DialogTitle>
          <DialogDescription>
            El pedido quedará pausado mientras editas. Al guardar, el empleado continuará con el siguiente y luego retomará el tuyo.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Dirección de envío</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 bg-muted text-foreground font-medium rounded-full hover:bg-muted/80 transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
