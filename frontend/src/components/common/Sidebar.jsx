"use client";

import Link from "next/link";
import useAuthStore from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { 
    Users, 
    CreditCard, 
    Stethoscope, 
    Beaker, 
    ShoppingBag, 
    Package, 
    LogOut,
    Activity,
    Shield,
    Hotel,
    LayoutDashboard,
    Search,
    ChevronLeft,
    ChevronRight,
    Command,
    CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const iconMap = {
    Dashboard: LayoutDashboard,
    Patients: Users,
    Billing: CreditCard,
    Consultation: Stethoscope,
    Lab: Beaker,
    Pharmacy: ShoppingBag,
    Inventory: Package,
    "Admin Terminal": Shield,
    "IPD Dashboard": Hotel,
    Appointments: CalendarDays,
};

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const role = user?.role;

    const menu = {
        Receptionist: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "Patients", path: "/dashboard/patients" },
            { name: "Appointments", path: "/dashboard/appointments" },
            { name: "Billing", path: "/dashboard/billing" },
            { name: "IPD Dashboard", path: "/dashboard/ipd" },
        ],
        Doctor: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "Appointments", path: "/dashboard/appointments" },
            { name: "Consultation", path: "/dashboard/consultations" },
            { name: "IPD Dashboard", path: "/dashboard/ipd" },
        ],
        Lab: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "Lab", path: "/dashboard/lab" },
        ],
        Pharmacist: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "Pharmacy", path: "/dashboard/pharmacy" },
            { name: "Inventory", path: "/dashboard/inventory" },
        ],
        Admin: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "Appointments", path: "/dashboard/appointments" },
            { name: "Admin Terminal", path: "/dashboard/admin" },
            { name: "IPD Dashboard", path: "/dashboard/ipd" },
        ],
    };

    return (
        <motion.div 
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 relative z-[50]"
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3 overflow-hidden whitespace-nowrap">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-white font-bold tracking-tight text-lg leading-none">NEXUS <span className="text-primary italic">MED</span></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hospital OS v2.0</span>
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
                <div>
                    {!collapsed && (
                        <h4 className="px-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Clinical Modules
                        </h4>
                    )}
                    <div className="space-y-1.5">
                        {menu[role]?.map((item) => {
                            const Icon = iconMap[item.name] || Activity;
                            const isActive = pathname === item.path;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <Button
                                        variant="ghost"
                                        className={`w-full ${collapsed ? "justify-center px-0" : "justify-start px-4"} h-11 gap-3 transition-all relative group ${
                                            isActive 
                                            ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-bold" 
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-slate-400 group-hover:text-white"}`} />
                                        {!collapsed && <span className="text-sm">{item.name}</span>}
                                        {isActive && (
                                            <motion.div 
                                                layoutId="sidebar-active"
                                                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                            />
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {!collapsed && (
                    <Card className="bg-slate-800/50 border-slate-700/50 p-4 mx-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Command className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Quick Tips</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            Press <span className="text-white font-bold">Cmd+K</span> to quickly search for patients or prescriptions.
                        </p>
                    </Card>
                )}
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-slate-800 space-y-4">
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"} py-2`}>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-primary font-bold shrink-0 shadow-inner">
                        {user?.name?.charAt(0)}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{user?.role}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={`w-full ${collapsed ? "justify-center" : "justify-start px-4"} h-11 gap-3 text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all`}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="text-sm font-bold">Terminate Session</span>}
                </Button>
            </div>

            {/* Collapse Toggle */}
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl z-[60]"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </motion.div>
    );
}