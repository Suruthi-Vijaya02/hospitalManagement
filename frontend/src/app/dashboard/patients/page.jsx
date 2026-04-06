"use client";

import { useEffect, useState } from "react";
import { getPatients, createPatient } from "@/services/patient.service";
import { motion, AnimatePresence } from "framer-motion";
import { 
    UserPlus, 
    Users, 
    Search, 
    Filter, 
    Calendar, 
    Phone, 
    MapPin, 
    Droplets,
    ChevronRight,
    ArrowUpRight,
    MoreVertical
} from "lucide-react";

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [form, setForm] = useState({
        name: "", age: "", gender: "Male", phone: "", address: "", 
        appointmentDate: "", appointmentTime: "", bloodGroup: "O+"
    });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPatients = async () => {
        try {
            const res = await getPatients();
            if (res?.data?.data) {
                setPatients(res.data.data);
            } else if (res?.data) {
                setPatients(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch patients", error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPatient(form);
            setForm({
                ...form,
                name: "", age: "", phone: "", address: "", 
                appointmentDate: "", appointmentTime: ""
            });
            await fetchPatients();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.upid?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-20"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">
                        Patient <span className="text-primary italic">Registry</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage and track patient information with precision.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find by name or UPID..." 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                
                {/* Registration Form */}
                <motion.div 
                    variants={item}
                    initial="hidden"
                    animate="show"
                    className="glass-card p-8 border border-slate-200/50 dark:border-white/10"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Register</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input required placeholder="John Doe" 
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:text-white" 
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                                    <input required type="number" placeholder="25" 
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:text-white" 
                                        value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none dark:text-white"
                                        value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none dark:text-white"
                                    value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input required placeholder="+1 234 567 890" 
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:text-white" 
                                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={loading} 
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {loading ? "Registering..." : (
                                <>
                                    Register Patient
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Patient List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Records</h2>
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                                {filteredPatients.length} Total
                            </span>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    <motion.div 
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredPatients.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-20 text-center"
                                >
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No patients found</h3>
                                    <p className="text-slate-500 text-sm mt-1">Try adjusting your search query.</p>
                                </motion.div>
                            ) : (
                                filteredPatients.map((p) => (
                                    <motion.div 
                                        key={p._id}
                                        variants={item}
                                        layout
                                        className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/30 rounded-3xl p-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                    {p.name?.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{p.name}</h4>
                                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {p.upid}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-slate-400 text-xs font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Activity className="w-3 h-3" /> {p.age}y • {p.gender}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Droplets className="w-3 h-3 text-rose-500" /> {p.bloodGroup}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-8">
                                                <div className="hidden md:flex flex-col items-end">
                                                    <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
                                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                                        {p.appointmentDate ? new Date(p.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Appt'}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.appointmentTime || '--:--'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button className="p-2.5 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2.5 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
}

// Sub-component or simplified mock for consistency
const Activity = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);