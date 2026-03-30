"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Package, 
    Plus, 
    Search, 
    RefreshCcw, 
    AlertTriangle, 
    CheckCircle2, 
    ChevronRight, 
    TrendingUp, 
    Calendar,
    MoreVertical,
    Layers,
    ShoppingCart
} from "lucide-react";

export default function InventoryPage() {
    const [data, setData] = useState([]);
    const [form, setForm] = useState({ name: "", quantity: "", price: "", expiryDate: "" });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get("/medicine");
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const add = async () => {
        if (!form.name || !form.quantity || !form.price) {
            setError("All essential fields required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await api.post("/medicine", {
                medicineName: form.name,
                stock: Number(form.quantity),
                expiryDate: form.expiryDate,
                price: Number(form.price)
            });
            setForm({ name: "", quantity: "", price: "", expiryDate: "" });
            fetch();
        } catch (err) {
            setError(err?.response?.data?.message || "Internal inventory synchronization failure.");
        } finally {
            setSaving(false);
        }
    };

    const filteredData = data.filter(m => 
        m.medicineName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockCount = data.filter(m => Number(m.stock) < 10 && Number(m.stock) > 0).length;
    const outOfStockCount = data.filter(m => Number(m.stock) <= 0).length;

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
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">
                        Inventory <span className="text-primary italic">Manager</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Real-time pharmaceutical stock and supply chain tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find records..." 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetch}
                        disabled={loading}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Inventory", value: data.length, icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Low Stock Units", value: lowStockCount, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Depleted Items", value: outOfStockCount, icon: ShoppingCart, color: "text-rose-500", bg: "bg-rose-500/10" },
                ].map((card, idx) => (
                    <motion.div key={idx} variants={item} initial="hidden" animate="show" transition={{ delay: idx * 0.1 }} className="glass-card p-6 border border-slate-200/50 dark:border-white/10 group hover:border-primary/30 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{card.label}</span>
                        </div>
                        <div className="text-3xl font-outfit font-bold text-slate-900 dark:text-white">{card.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left: Input Console (Col 1-4) */}
                <div className="lg:col-span-4 h-fit sticky top-10">
                    <motion.div 
                        variants={item}
                        initial="hidden"
                        animate="show"
                        className="glass-card p-8 border border-slate-200 dark:border-white/10 shadow-lg"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Plus className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registry Console</h3>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-600 font-bold rounded-xl mb-6 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6 text-sm">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Investigation Group • Name</label>
                                <input 
                                    placeholder="Enter item identifier" 
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Qty</label>
                                    <input 
                                        type="number"
                                        placeholder="00" 
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                                    <input 
                                        type="number"
                                        placeholder="00.00" 
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batch Expiration</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                        value={form.expiryDate}
                                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                                    />
                                </div>
                            </div>
                            
                            <button 
                                onClick={add} 
                                disabled={saving}
                                className="w-full bg-slate-900 dark:bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group mt-4"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {saving ? "Synchronizing..." : (
                                    <>
                                        Add to Registry
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Master Stock Ledger (Col 5-12) */}
                <div className="lg:col-span-8">
                    <motion.div 
                        variants={item}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.2 }}
                        className="glass-card border border-slate-200/50 dark:border-white/10 overflow-hidden shadow-sm"
                    >
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Master Stock Ledger</h2>
                            </div>
                            <span className="bg-primary/5 text-primary text-[10px] font-bold px-4 py-1.5 rounded-full border border-primary/10 tracking-widest uppercase">{filteredData.length} Registry Entries</span>
                        </div>
                        
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-50 dark:border-slate-800">
                                        <th className="py-6 px-8">Investigation • Grade</th>
                                        <th className="py-6 px-8 text-right">Unit Price</th>
                                        <th className="py-6 px-8 text-center">Batch Expiry</th>
                                        <th className="py-6 px-8 text-right">Synchronization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                         <Search className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold text-sm tracking-tight uppercase">No records matching registry query</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((m) => {
                                            const isLow = Number(m.stock) < 10 && Number(m.stock) > 0;
                                            const isOut = Number(m.stock) <= 0;
                                            return (
                                              <tr key={m._id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group/row">
                                                  <td className="py-6 px-8">
                                                      <div className="flex items-center gap-4">
                                                          <div className={`w-2 h-10 rounded-full transition-colors ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                          <div>
                                                              <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{m.medicineName}</h5>
                                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Medical Grade Supply</p>
                                                          </div>
                                                      </div>
                                                  </td>
                                                  <td className="py-6 px-8 text-right">
                                                      <div className="flex flex-col items-end gap-0.5">
                                                          <span className="text-sm font-outfit font-bold text-slate-900 dark:text-white tracking-tight">₹{m.price?.toLocaleString()}</span>
                                                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Per Unit</span>
                                                      </div>
                                                  </td>
                                                  <td className="py-6 px-8 text-center">
                                                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">
                                                          <Calendar className="w-3.5 h-3.5" />
                                                          {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '∞ Perpetual'}
                                                      </div>
                                                  </td>
                                                  <td className="py-6 px-8 text-right">
                                                      <div className="flex flex-col items-end gap-2">
                                                          <span className={`text-sm font-bold ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                                                              {m.stock} Unit{m.stock !== 1 ? 's' : ''}
                                                          </span>
                                                          <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                                                              isOut ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                                              isLow ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                          }`}>
                                                              {isOut ? 'Depleted' : isLow ? 'Critical Stock' : 'Optimized'}
                                                          </div>
                                                      </div>
                                                  </td>
                                              </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}