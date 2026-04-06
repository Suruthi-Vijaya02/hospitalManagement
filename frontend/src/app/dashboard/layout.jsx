"use client";

import Sidebar from "@/components/common/Sidebar";
import useAuthStore from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, ChevronRight, User } from "lucide-react";

export default function DashboardLayout({ children }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    if (!user) return null;

    // Simplified breadcrumb logic
    const pathParts = pathname.split("/").filter(Boolean);
    
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-inter overflow-hidden">
            {/* Sidebar (Modernized in previous step) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Impeccable Topbar */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
                    
                    {/* Left: Search & Navigation Context */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <span>Dashboard</span>
                            {pathParts.slice(1).map((part, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                    <span className="text-slate-900 dark:text-white capitalize">{part}</span>
                                </div>
                            ))}
                        </div>
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Universal Search..." 
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2.5 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Right: User & Actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">System Live</span>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

                        <button className="p-2.5 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        
                        <button className="p-2.5 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            <Settings className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 group cursor-pointer">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{user.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area with Animation */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="min-h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

            </div>
        </div>
    );
}