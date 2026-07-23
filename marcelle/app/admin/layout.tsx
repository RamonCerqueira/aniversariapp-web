
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Users, FileText, LogOut, Menu, X, Settings, History } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/familias", label: "Famílias e Convidados", icon: Users },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileText },
  { href: "/admin/auditoria", label: "Logs de Auditoria", icon: History },
  // { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    // Clear cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  };

  // Skip layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex print:block">
      {/* Mobile Sidebar Toggle - Hidden in Print */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gold/10 rounded-full print:hidden"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="text-gold" /> : <Menu className="text-gold" />}
      </button>

      {/* Sidebar - Hidden in Print */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : 0 }}
        className={`fixed lg:relative z-40 w-64 h-screen bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 print:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-cinzel text-gold font-bold">Marcelle 15</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gold/10 text-gold border border-gold/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-ruby-light hover:bg-ruby/10 rounded-xl w-full transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black p-4 lg:p-8 print:bg-white print:text-black print:overflow-visible print:p-0">
        <div className="max-w-7xl mx-auto print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
