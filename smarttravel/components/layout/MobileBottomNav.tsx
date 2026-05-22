"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, User, Plus } from "lucide-react";

const items = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/monitoramentos", icon: Search, label: "Monitorar" },
  { href: "/alertas", icon: Bell, label: "Alertas" },
  { href: "/conta", icon: User, label: "Conta" },
];

export function MobileBottomNav() {
  const path = usePathname();
  // Esconde a navegação nas telas públicas (landing, login, cadastro)
  const hideOn = ["/", "/login", "/register"];
  if (hideOn.includes(path)) return null;
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[88px] bg-bg/75 backdrop-blur-2xl border-t border-white/15 flex px-5 pt-3 pb-7 z-40">
      {items.slice(0, 2).map((it) => <NavBtn key={it.href} {...it} active={path === it.href} />)}
      <Link href="/monitoramentos" className="flex-none w-[54px] h-[54px] -mt-7 rounded-2xl bg-gradient-to-br from-ai to-tech grid place-items-center shadow-[0_14px_30px_-8px_rgba(124,58,237,0.7)] border-[3px] border-bg">
        <Plus className="w-6 h-6 text-white" strokeWidth={2.4} />
      </Link>
      {items.slice(2).map((it) => <NavBtn key={it.href} {...it} active={path === it.href} />)}
    </nav>
  );
}

function NavBtn({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex-1 flex flex-col items-center gap-1.5 font-display text-[10.5px] font-bold transition-colors ${active ? "text-turq" : "text-muted"}`}>
      <Icon className={`w-[23px] h-[23px] ${active ? "drop-shadow-[0_0_10px_#5EEAD4]" : ""}`} strokeWidth={2.2} />
      {label}
    </Link>
  );
}
