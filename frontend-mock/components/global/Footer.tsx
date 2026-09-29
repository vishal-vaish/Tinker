import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/mock-data";
import { Logo } from "@/components/global/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 text-xs text-muted-foreground select-none">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 font-mono font-bold text-foreground">
              <Logo size={24} />
              <span className="tracking-tight text-sm font-bold">TINKER</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Autonomous fullstack agentic coding platform with in-browser WebContainers, private neural execution, and isolated PostgreSQL sandboxes.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-foreground font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">Developers</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} Tinker Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition">Privacy Policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground transition">Terms of Service</Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground transition">Security & PathJail</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
