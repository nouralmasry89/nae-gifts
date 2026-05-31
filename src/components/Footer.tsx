import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { FACEBOOK_URL, INSTAGRAM_URL, WHATSAPP_NUMBER, categories, waLink } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold">N.A.E Gifts Store</h3>
          <p className="mt-2 text-sm text-muted-foreground">هدايا مصنوعة يدوياً ومصممة خصيصاً حسب رغبتك لكل المناسبات.</p>
          <div className="mt-4 flex items-center gap-4">
            <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-muted-foreground hover:text-primary"><MessageCircle className="h-5 w-5" /></a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold">الأقسام</h4>
          <ul className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">تواصل معنا</h4>
          <p className="mt-3 text-sm text-muted-foreground">واتساب: <span dir="ltr">+{WHATSAPP_NUMBER}</span></p>
          <Link to="/contact" className="mt-3 inline-block text-sm text-primary hover:underline">صفحة التواصل</Link>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} N.A.E Gifts Store — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
