"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/auth.store";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    ArrowUpRight, 
    Calendar, 
    Activity, 
    Clock, 
    Plus, 
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    MessageSquare,
    Stethoscope,
    CreditCard,
    ChevronRight,
    Bell,
    Settings,
    LayoutDashboard
} from "lucide-react";

export default function DashboardHome() {
    const { user } = useAuthStore();
    const [liveStats, setLiveStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/dashboard");
                if (res.data?.success) {
                    setLiveStats(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { 
            label: "Active Patients", 
            value: loading ? "..." : (liveStats?.totalPatients?.toLocaleString() || "0"), 
            change: "+12%", 
            icon: Users, 
            color: "text-blue-500", 
            bg: "bg-blue-500/10" 
        },
        { 
            label: "Consultations", 
            value: loading ? "..." : (liveStats?.consultationsToday?.toLocaleString() || "0"), 
            change: "Today", 
            icon: Activity, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
        },
        { 
            label: "Lab Reports", 
            value: loading ? "..." : (liveStats?.pendingLabReports?.toLocaleString() || "0"), 
            change: "Pending", 
            icon: Clock, 
            color: "text-amber-500", 
            bg: "bg-amber-500/10" 
        },
        { 
            label: "Inventory Alerts", 
            value: loading ? "..." : (liveStats?.lowStockMedicines?.toLocaleString() || "0"), 
            change: "Low Stock", 
            icon: Calendar, 
            color: "text-violet-500", 
            bg: "bg-violet-500/10" 
        },
    ];

    const actions = [
        { title: "Register Patient", description: "Onboard a new patient to the centralized records.", icon: Plus, link: "/dashboard/patients" },
        { title: "Consultation Unit", description: "Start a new diagnostic session for a patient.", icon: Stethoscope, link: "/dashboard/consultations" },
        { title: "Financial Terminal", description: "Generate invoices and reconcile payments.", icon: CreditCard, link: "/dashboard/billing" },
        { title: "System Settings", description: "Configure regional parameters and roles.", icon: Settings, link: "/dashboard/settings" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-12 pb-20"
        >
            {/* Header / Command Center */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <LayoutDashboard className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Command</span>
                    </div>
                    <h1 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">
                        Command <span className="text-primary italic">Center</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
                    <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.[0] || "U"}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Hero / Welcome */}
            <motion.div variants={item} initial="hidden" animate="show" className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-200/50 dark:border-white/10 shadow-2xl">
                    <div className="space-y-6 flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-primary/10 border border-slate-800 dark:border-primary/20 text-white dark:text-primary text-[10px] font-bold uppercase tracking-widest shadow-xl">
                            <ShieldCheck className="w-3.5 h-3.5" /> Core Protocol Alpha-9
                        </div>
                        <h2 className="text-4xl md:text-6xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                            Welcome back, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">{user?.name?.split(' ')[0]}</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                            System diagnostics indicate <span className="text-primary font-bold">peak operational status</span>. You have 4 critical consultations in the pending queue.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group/btn">
                                Launch Workflow
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                                System Logs
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block relative">
                         <div className="w-64 h-64 bg-primary/5 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                         <div className="relative z-10 p-8 glass-card border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl rounded-[3rem] rotate-3">
                             <div className="space-y-4">
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                         <TrendingUp className="w-6 h-6" />
                                     </div>
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                                         <p className="text-xl font-bold text-slate-900 dark:text-white">+94.2%</p>
                                     </div>
                                 </div>
                                 <div className="h-[2px] w-full bg-slate-100 dark:bg-slate-800" />
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                         <Users className="w-6 h-6" />
                                     </div>
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Nodes</p>
                                         <p className="text-xl font-bold text-slate-900 dark:text-white">1,280+</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat, idx) => (
                    <motion.div key={idx} variants={item} className="group cursor-default">
                        <div className="glass-card p-6 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 bg-white dark:bg-slate-900/50">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-4 rounded-[1.25rem] ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-full border border-emerald-500/10">
                                    <TrendingUp className="w-3 h-3" /> {stat.change}
                                </div>
                            </div>
                            <h3 className="text-3xl font-outfit font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Bottom Section: Actions & Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Quick Actions */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">System Navigation</h2>
                        <button className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                            Full Registry <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {actions.map((action, idx) => (
                            <motion.button 
                                key={idx} 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center group-hover:bg-primary transition-colors text-slate-400 group-hover:text-white">
                                        <action.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{action.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{action.description}</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all">
                                    <ArrowUpRight className="w-5 h-5 text-primary" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Status Console */}
                <div className="lg:col-span-4 space-y-8">
                     <h2 className="text-2xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight px-2">Announcements</h2>
                     <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800 group hover:scale-[1.02] transition-transform">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                        <MessageSquare className="absolute -bottom-8 -right-8 w-32 h-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/60 text-[10px] font-bold uppercase tracking-widest border border-white/5">
                                Critical Notice
                            </div>
                            <h4 className="text-2xl font-outfit font-bold leading-snug">System maintenance scheduled for 02:00 UTC.</h4>
                            <p className="text-sm text-white/50 font-medium">Please ensure all pending consultations are finalized before the reconciliation window.</p>
                            <button className="w-full py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-white/5">
                                Acknowledge Protocol
                            </button>
                        </div>
                     </div>
                </div>

            </div>

        </motion.div>
    );
}