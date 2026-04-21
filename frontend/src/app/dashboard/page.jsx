"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/auth.store";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    Activity, 
    Clock, 
    Plus, 
    TrendingUp,
    ShieldCheck,
    Stethoscope,
    CreditCard,
    ChevronRight,
    AlertCircle,
    UserPlus,
    FileText,
    Zap,
    CalendarDays,
    Package,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Beaker
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHome() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [liveStats, setLiveStats] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Use allSettled so one failure doesn't break the whole dashboard
                const [statsResult, apptResult] = await Promise.allSettled([
                    api.get("/dashboard"),
                    api.get("/appointments/today"),
                ]);

                if (statsResult.status === "fulfilled" && statsResult.value.data?.success) {
                    setLiveStats(statsResult.value.data.data);
                }
                if (apptResult.status === "fulfilled" && apptResult.value.data?.success) {
                    setTodayAppointments(apptResult.value.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const stats = [
        { 
            label: "Total Patients", 
            value: loading ? null : (liveStats?.totalPatients?.toLocaleString() || "0"), 
            sub: "Registered records",
            icon: Users, 
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        { 
            label: "Today's Appointments", 
            value: loading ? null : (liveStats?.appointmentsToday?.toLocaleString() || "0"), 
            sub: `${liveStats?.appointmentsScheduled || 0} scheduled`,
            icon: CalendarDays, 
            color: "text-violet-600",
            bg: "bg-violet-50",
            border: "border-violet-100"
        },
        { 
            label: "Pending Lab Reports", 
            value: loading ? null : (liveStats?.pendingLabReports?.toLocaleString() || "0"), 
            sub: "Awaiting results",
            icon: Beaker, 
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            alert: (liveStats?.pendingLabReports || 0) > 5
        },
        { 
            label: "Low Stock Medicines", 
            value: loading ? null : (liveStats?.lowStockMedicines?.toLocaleString() || "0"), 
            sub: "Below reorder level",
            icon: Package, 
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-100",
            alert: (liveStats?.lowStockMedicines || 0) > 0
        },
    ];

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest text-[10px]">
                            NEXUS CORE V2.5
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Instance: Active</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                        Clinical <span className="text-primary font-black">Dashboard</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                        Welcome back, <span className="font-bold text-slate-700">{user?.name}</span>. Here is your facility's real-time status.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => router.push("/dashboard/appointments")} className="gap-2 border-slate-300 font-bold text-xs h-11 px-5">
                        <CalendarDays className="w-4 h-4" /> Schedule
                    </Button>
                    <Button className="gap-2 font-bold text-xs h-11 px-5 shadow-xl shadow-primary/20" onClick={() => router.push("/dashboard/patients")}>
                        <Plus className="w-4 h-4" /> New Patient
                    </Button>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                    >
                        <Card className={`p-6 border-slate-300 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${stat.alert ? 'ring-2 ring-rose-500/20' : ''}`}>
                            {stat.alert && (
                                <div className="absolute top-3 right-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-pulse" />
                                </div>
                            )}
                            <div className="flex items-start justify-between mb-5">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-9 w-16" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            ) : (
                                <>
                                    <h3 className={`text-4xl font-black mb-1 ${stat.alert ? 'text-rose-600' : 'text-slate-900'}`}>{stat.value}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{stat.sub}</p>
                                </>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Today's Appointments */}
                <Card className="lg:col-span-8 border-slate-300 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Today's Appointments</h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/appointments")} className="gap-1.5 font-bold text-xs border-slate-300 h-9">
                            View All <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <CalendarDays className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">No appointments today</p>
                                <p className="text-xs text-slate-400 mt-1">Schedule one to get started</p>
                                <Button size="sm" onClick={() => router.push("/dashboard/appointments")} className="mt-4 gap-1.5 text-xs font-bold">
                                    <Plus className="w-3.5 h-3.5" /> Book Appointment
                                </Button>
                            </div>
                        ) : (
                            todayAppointments.slice(0, 6).map((appt) => {
                                const statusColors = {
                                    Scheduled: "text-blue-600 bg-blue-50 border-blue-200",
                                    Completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
                                    Cancelled: "text-rose-600 bg-rose-50 border-rose-200",
                                    "No-Show": "text-amber-600 bg-amber-50 border-amber-200",
                                };
                                return (
                                    <div key={appt._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group">
                                        <div className="w-14 h-14 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5 text-primary mb-0.5" />
                                            <span className="text-xs font-black text-primary">{appt.appointmentTime}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{appt.patientName}</p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dr. {appt.doctorName} · {appt.department}</p>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${statusColors[appt.status]}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-5">

                    {/* Stock Alerts */}
                    {!loading && liveStats?.lowStockItems?.length > 0 && (
                        <Card className="border-rose-200 bg-rose-50/50 overflow-hidden">
                            <div className="p-5 border-b border-rose-100 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest">Low Stock Alert</h3>
                                <Badge className="ml-auto bg-rose-500 text-white text-[10px] font-black">
                                    {liveStats.lowStockItems.length}
                                </Badge>
                            </div>
                            <div className="divide-y divide-rose-100">
                                {liveStats.lowStockItems.slice(0, 5).map((item) => (
                                    <div key={item._id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{item.medicineName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Reorder at: {item.reorderLevel}</p>
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${item.stock === 0 ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'}`}>
                                            {item.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4">
                                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/inventory")} className="w-full border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 text-xs font-bold gap-1.5 h-9">
                                    <Package className="w-3.5 h-3.5" /> Manage Inventory
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-1 mb-3">Rapid Actions</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { title: "Patient Intake", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50", path: "/dashboard/patients" },
                                { title: "Schedule Appt.", icon: CalendarDays, color: "text-violet-500", bg: "bg-violet-50", path: "/dashboard/appointments" },
                                { title: "Billing Desk", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50", path: "/dashboard/billing" },
                                { title: "System Audit", icon: ShieldCheck, color: "text-slate-500", bg: "bg-slate-100", path: "/dashboard/admin" },
                            ].map((action, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    onClick={() => router.push(action.path)}
                                    className="h-14 justify-start px-4 gap-4 border-slate-300 hover:border-primary/30 hover:bg-primary/5 transition-all group rounded-2xl"
                                >
                                    <div className={`w-8 h-8 rounded-xl ${action.bg} flex items-center justify-center flex-shrink-0`}>
                                        <action.icon className={`w-4 h-4 ${action.color}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{action.title}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary transition-colors" />
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Departmental Workload */}
                    <Card className="border-slate-300 p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" /> Dept. Workload
                        </h3>
                        <div className="space-y-4">
                            {[
                                { dept: "Emergency", load: 85, color: "bg-rose-500" },
                                { dept: "OPD", load: 42, color: "bg-primary" },
                                { dept: "Lab", load: loading ? 0 : Math.min(100, (liveStats?.pendingLabReports || 0) * 10), color: "bg-amber-500" },
                                { dept: "Pharmacy", load: 31, color: "bg-emerald-500" },
                            ].map((dept, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-600">{dept.dept}</span>
                                        <span className="text-[10px] font-black text-slate-400">{dept.load}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${dept.load}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={`h-full ${dept.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}