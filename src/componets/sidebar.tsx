import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/oportunidades", label: "Oportunidades" },
];

export function Sidebar() {
  return (
    <aside className="min-h-screen w-full max-w-xs border-r border-slate-200 bg-slate-950 p-6 text-white">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">SANDECH</p>
        <h2 className="mt-2 text-2xl font-bold">CRM</h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
