import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, user_name, rating, comment, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setReviews(data as Review[]);
    };
    load();

    const channel = supabase
      .channel("public-reviews")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <section id="resenas" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-semibold mb-3">
            <MessageSquare size={14} /> Reseñas de clientes
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Lo que dicen nuestros clientes
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className={Number(avg) >= s ? "fill-secondary text-secondary" : "text-muted"} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avg} / 5 ({reviews.length} reseñas)</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">
            Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-background rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground text-sm">{r.user_name || "Cliente"}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={r.rating >= s ? "fill-secondary text-secondary" : "text-muted"} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground italic">"{r.comment}"</p>}
                <p className="text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
