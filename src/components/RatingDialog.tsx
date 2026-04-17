import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { rateLimit, rateLimitMessage } from "@/lib/rateLimit";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderId: string;
  userId: string;
  userName: string;
  onSubmitted?: () => void;
}

const RatingDialog = ({ open, onOpenChange, orderId, userId, userName, onSubmitted }: Props) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rateLimit(`review-${userId}`, 3, 60_000)) {
      toast.error(rateLimitMessage(60));
      return;
    }
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      user_id: userId,
      user_name: userName || "Cliente",
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Ya calificaste este pedido" : error.message);
      return;
    }
    toast.success("¡Gracias por tu reseña!");
    onSubmitted?.();
    onOpenChange(false);
    setRating(0); setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Califica tu pedido</DialogTitle>
          <DialogDescription>Tu opinión ayuda a mejorar el servicio.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={(hover || rating) >= s ? "fill-secondary text-secondary" : "text-muted-foreground/40"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Comparte tu experiencia (opcional)..."
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Enviar reseña
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
