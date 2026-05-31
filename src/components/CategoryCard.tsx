import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/categories";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary"
    >
      <div className="aspect-square overflow-hidden">
        <img src={category.image} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
        <h3 className="text-base font-bold text-white">{category.name}</h3>
      </div>
    </Link>
  );
}
