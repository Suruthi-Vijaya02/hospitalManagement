"use client";

import Link from "next/link";
import useAuthStore from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
    Users, 
    CreditCard, 
    Stethoscope, 
    Beaker, 
    ShoppingBag, 
    Package, 
    LogOut,
    Activity,
    ChevronRight
} from "lucide-react";

const iconMap = {
    Patients: Users,
    Billing: CreditCard,
    Consultation: Stethoscope,
    Lab: Beaker,
    Pharmacy: ShoppingBag,
    Inventory: Package
};

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const role = user?.role;

    const menu = {
        Receptionist: [
            { name: "Patients", path: "/dashboard/patients" },
            { name: "Billing", path: "/dashboard/billing" },
        ],
        Doctor: [
            { name: "Consultation", path: "/dashboard/consultations" },
        ],
        Lab: [
            { name: "Lab", path: "/dashboard/lab" },
        ],
        Pharmacist: [
            { name: "Pharmacy", path: "/dashboard/pharmacy" },
            { name: "Inventory", path: "/dashboard/inventory" },
        ],
    };

    return (
        <div className="w-72 bg-slate-900 text-slate-300 h-full flex flex-col relative overflow-hidden border-r border-white/5">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {/* Logo Section */}
            <div className="p-8 relative z-10">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-outfit font-bold text-white tracking-tight">HMS Core</span>
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto relative z-10">
                <p className="px-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Management</p>
                {menu[role]?.map((item) => {
                    const Icon = iconMap[item.name] || Activity;
                    const isActive = pathname === item.path;
                    
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className="block group"
                        >
                            <div className={`
                                relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300
                                ${isActive 
                                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                    : "hover:bg-white/5 hover:text-white"
                                }
                            `}>
                                <div className="flex items-center gap-3.5">
                                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary transition-colors"}`} />
                                    <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                                </div>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeGlow"
                                        className="absolute inset-0 bg-primary/20 blur-xl -z-10 rounded-2xl"
                                    />
                                )}
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 mt-auto border-t border-white/5 relative z-10">
                <div className="p-4 mb-2 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-primary">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}