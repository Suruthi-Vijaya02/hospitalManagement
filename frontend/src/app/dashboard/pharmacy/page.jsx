"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Pill, 
    Search, 
    RefreshCcw, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ChevronRight,
    PackageCheck,
    History,
    MoreVertical
} from "lucide-react";

export default function PharmacyPage() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchQueue = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await api.get("/pharmacy/queue");
            if (res.data?.success) {
                setQueue(res.data.data);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to synchronize pharmacy records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const issue = async (id, index) => {
        try {
            setErrorMsg("");
            const res = await api.put("/pharmacy/issue", { queueId: id, index });
            if (res.data?.success) {
                fetchQueue();
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.response?.data?.message || "Stock reconciliation failed. Verify inventory levels.");
            setTimeout(() => setErrorMsg(""), 6000);
        }
    };

    const filteredQueue = queue.filter(q => 
        q.upid?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
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
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">
                        Dispensing <span className="text-primary italic">Terminal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Reconcile prescriptions and monitor inventory flow.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find by UPID..." 
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none uppercase font-mono tracking-wider dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetchQueue}
                        disabled={loading}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-3xl flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-sm shadow-xl shadow-rose-500/5 mx-2"
                    >
                        <AlertCircle className="w-5 h-5" />
                        {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Queue List */}
            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-8 pb-10"
            >
                {filteredQueue.length === 0 && !loading ? (
                    <motion.div 
                        variants={item}
                        className="flex flex-col items-center justify-center py-32 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800"
                    >
                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm">
                             <Pill className="w-12 h-12 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">Terminal Idle</h4>
                        <p className="text-slate-400 text-sm mt-1 max-w-[250px] text-center font-medium">No pending prescriptions found in the dispensing queue.</p>
                    </motion.div>
                ) : null}

                <AnimatePresence mode="popLayout">
                    {filteredQueue.map((q) => (
                        <motion.div 
                            key={q._id}
                            layout
                            variants={item}
                            className="glass-card overflow-hidden border border-slate-300/50 dark:border-white/10 group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                        >
                            {/* Card Header */}
                            <div className="px-8 py-6 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <PackageCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-outfit font-bold text-slate-900 dark:text-white uppercase tracking-wider">{q.upid}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                                                q.status === "Completed" 
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            }`}>
                                                {q.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                                            <History className="w-3 h-3" />
                                            Reconciled {new Date(q.updatedAt || q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-3 bg-white dark:bg-slate-900 text-slate-300 hover:text-primary transition-colors rounded-xl border border-slate-100 dark:border-slate-800">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Medicines Table */}
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-slate-50 dark:border-slate-800 uppercase tracking-[0.2em] text-[10px] font-bold">
                                            <th className="py-5 px-10">Investigation • Medicine</th>
                                            <th className="py-5 px-10 text-center">Unit Volume</th>
                                            <th className="py-5 px-10 text-right">Synchronization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {q.medicines.map((m, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group/row">
                                                <td className="py-6 px-10">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium tracking-tight">Prescription Grade Drug</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-10 text-center">
                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {m.quantity}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-10 text-right">
                                                    {m.status === "Issued" ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-xl border border-emerald-500/20 uppercase tracking-widest">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Dispatched
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => issue(q._id, i)}
                                                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] outline-none flex items-center justify-center gap-2 ml-auto"
                                                        >
                                                            Issue Unit
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}