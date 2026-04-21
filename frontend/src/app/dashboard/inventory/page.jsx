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
    ShoppingCart,
    Loader2,
    Activity,
    PackageCheck,
    AlertCircle,
    Database
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
    const [data, setData] = useState([]);
    const [form, setForm] = useState({ name: "", quantity: "", price: "", expiryDate: "", batchNumber: "", manufacturer: "", reorderLevel: "10" });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get("/medicine");
            if (res.data?.success) setData(res.data.data);
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
        if (!form.name || !form.quantity || !form.price || !form.batchNumber) {
            setError("Core metadata required: Name, Qty, Price, and Batch Number.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await api.post("/medicine", {
                medicineName: form.name,
                stock: Number(form.quantity),
                expiryDate: form.expiryDate,
                price: Number(form.price),
                batchNumber: form.batchNumber,
                manufacturer: form.manufacturer,
                reorderLevel: Number(form.reorderLevel)
            });
            setForm({ name: "", quantity: "", price: "", expiryDate: "", batchNumber: "", manufacturer: "", reorderLevel: "10" });
            fetch();
        } catch (err) {
            setError(err?.response?.data?.message || "Registry synchronization failure.");
        } finally {
            setSaving(false);
        }
    };

    const filteredData = data.filter(m => 
        m.medicineName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockCount = data.filter(m => Number(m.stock) < 10 && Number(m.stock) > 0).length;
    const outOfStockCount = data.filter(m => Number(m.stock) <= 0).length;

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black tracking-widest text-[10px]">
                            SUPPLY CHAIN UNIT
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory: Optimized</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Pharmacy <span className="text-primary font-black">Sentinel</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Manage pharmaceutical inventory, batch tracking, and medical supply reconciliation.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Card className="px-6 py-3 border-slate-300 bg-white/50 dark:bg-slate-900/50 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Critical</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{lowStockCount + outOfStockCount}</span>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <PackageCheck className="w-4 h-4 text-emerald-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Healthy</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{data.length - (lowStockCount + outOfStockCount)}</span>
                            </div>
                        </div>
                    </Card>
                    <Button onClick={fetch} disabled={loading} variant="outline" className="h-12 w-12 p-0 border-slate-200 dark:border-slate-800">
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Supply Registry Console */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-slate-300 shadow-xl overflow-hidden">
                        <div className="h-2 w-full bg-slate-900 dark:bg-primary" />
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <Plus className="w-5 h-5 text-primary" /> Registry Console
                            </CardTitle>
                            <CardDescription>Enroll new batches into the centralized pharmaceutical database.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 font-bold text-[10px] uppercase flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Medical Item Name</label>
                                    <Input placeholder="Enter Investigation or Drug Name" className="h-12 font-bold bg-slate-50 dark:bg-slate-900 placeholder:text-slate-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batch ID</label>
                                        <Input placeholder="BATCH-00" className="h-12 font-bold bg-slate-50 dark:bg-slate-900 placeholder:text-slate-500" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Manufacturer</label>
                                        <Input placeholder="MFG Corp" className="h-12 font-bold bg-slate-50 dark:bg-slate-900 placeholder:text-slate-500" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                                        <Input type="number" placeholder="0" className="h-12 font-bold bg-slate-50 dark:bg-slate-900 placeholder:text-slate-500" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Min Level</label>
                                        <Input type="number" placeholder="10" className="h-12 font-bold bg-slate-50 dark:bg-slate-900 placeholder:text-slate-500" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unit Price</label>
                                        <Input type="number" placeholder="₹" className="h-12 font-bold bg-slate-50 dark:bg-slate-900 placeholder:text-slate-500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batch Expiration</label>
                                    <Input type="date" className="h-12 font-bold bg-slate-50 dark:bg-slate-900" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button disabled={saving} onClick={add} className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Database className="w-4 h-4 mr-2" /> Sync with Database</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right: Master Stock Ledger */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="p-2 border-slate-300 shadow-xl relative z-[50]">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Audit Ledger by Medicine Name, Manufacturer, or Batch..."
                                className="h-14 pl-12 pr-6 border-none shadow-none focus-visible:ring-0 text-base font-bold dark:text-white placeholder:font-medium placeholder:text-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </Card>

                    <Card className="border-slate-300 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 py-6 px-8">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-primary" /> Master Stock Ledger
                                </CardTitle>
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest">{filteredData.length} Items Indexed</Badge>
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Medical Item</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Batch Protocol</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Unit Value</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Batch Expiry</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Availability</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => <tr key={i}><td colSpan="5" className="p-8"><Skeleton className="h-6 w-full" /></td></tr>)
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <Package className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching supplies found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredData.map((m) => {
                                        const isLow = Number(m.stock) < (m.reorderLevel || 10) && Number(m.stock) > 0;
                                        const isOut = Number(m.stock) <= 0;
                                        return (
                                            <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-1 h-8 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{m.medicineName}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.manufacturer || 'GENERIC MFR'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 text-center">
                                                    <Badge variant="outline" className="font-mono text-[10px] font-bold text-slate-500 border-slate-200 dark:border-slate-800 uppercase">{m.batchNumber || 'N/A'}</Badge>
                                                </td>
                                                <td className="py-5 px-8 text-right text-slate-900 dark:text-white font-black text-sm">₹{m.price?.toLocaleString()}</td>
                                                <td className="py-5 px-8 text-center font-bold text-xs text-slate-500 uppercase">
                                                    {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'PERPETUAL'}
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`text-sm font-black ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>{m.stock} Units</span>
                                                        <Badge className={`font-black text-[9px] uppercase tracking-widest ${
                                                            isOut ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                                            isLow ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        }`}>
                                                            {isOut ? 'Out of Stock' : isLow ? 'Critical' : 'Optimized'}
                                                        </Badge>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}