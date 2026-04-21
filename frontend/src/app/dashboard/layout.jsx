"use client";

import Sidebar from "@/components/common/Sidebar";
import useAuthStore from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, ChevronRight, User, Loader2 } from "lucide-react";

export default function DashboardLayout({ children }) {
    const { user, loadAuth } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const [time, setTime] = useState(new Date());
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        loadAuth();
        setIsHydrated(true);
    }, [loadAuth]);

    useEffect(() => {
        if (isHydrated && !user) {
            router.push("/login");
        }
    }, [user, isHydrated, router]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isHydrated) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating...</p>
            </div>
        );
    }

    if (!user) return null;

    // Simplified breadcrumb logic
    const pathParts = pathname.split("/").filter(Boolean);
    
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-inter overflow-hidden">
            {/* Professional Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* High-End Clinical Topbar */}
                <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-300 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
                    
                    {/* Left: Search & Navigation Context */}
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Current Section</span>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <span className="text-slate-700">Dashboard</span>
                                {pathParts.slice(1).map((part, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-slate-400" />
                                        <span className="text-primary capitalize">{part}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-10 w-[1px] bg-slate-300 mx-4 hidden lg:block"></div>

                        <div className="relative group hidden lg:block">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Universal Patient/Record Search (Alt+S)" 
                                className="bg-slate-50 border border-slate-300 focus:border-primary/50 rounded-xl py-2.5 pl-11 pr-4 text-xs w-80 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Right: Real-time Data & User Actions */}
                    <div className="flex items-center gap-6">
                        {/* Clinical Clock */}
                        <div className="hidden xl:flex flex-col items-end">
                            <span className="text-lg font-mono font-bold text-slate-900 leading-none tracking-tighter">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-300 mx-2 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 border border-transparent hover:border-slate-300 rounded-xl relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                            
                            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 border border-transparent hover:border-slate-300 rounded-xl">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-slate-300 group cursor-pointer">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900 leading-none">{user.name}</span>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{user.role}</span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/50 transition-all shadow-sm">
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