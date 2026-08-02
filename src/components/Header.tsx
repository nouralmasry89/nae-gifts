import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-nae.jpg";
import { FACEBOOK_URL, INSTAGRAM_URL, categories } from "@/lib/categories";
import { AccountStatusIcons } from "@/components/AccountStatusIcons";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="N.A.E Gifts Store" className="h-12 w-12 rounded-md object-cover" />
          <div className="leading-tight">
            <div className="text-base font-bold">N.A.E Gifts Store</div>
            <div className="text-xs text-muted-foreground">هدايا فريدة ومخصصة</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm hover:text-primary">الرئيسية</Link>
          <a href="/#categories" className="text-sm hover:text-primary">الأقسام</a>
          <Link to="/contact" className="text-sm hover:text-primary">تواصل معنا</Link>
          <div className="flex items-center gap-3 pr-3 border-r border-border">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <AccountStatusIcons />
          <button className="md:hidden" aria-label="القائمة" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm">
            <Link to="/" className="py-2" onClick={() => setOpen(false)}>الرئيسية</Link>
            {categories.map((c) => (
              <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="py-2 text-muted-foreground" onClick={() => setOpen(false)}>
                {c.name}
              </Link>
            ))}
            <Link to="/contact" className="py-2" onClick={() => setOpen(false)}>تواصل معنا</Link>
            <div className="flex items-center gap-4 pt-3">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
