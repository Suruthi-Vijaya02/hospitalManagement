"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    ReceiptText, 
    CreditCard, 
    History, 
    TrendingUp, 
    Download, 
    Printer, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    Wallet
} from "lucide-react";

export default function BillingPage() {
    const [upid, setUpid] = useState("");
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paying, setPaying] = useState(false);
    const [bills, setBills] = useState([]);
    const [loadingBills, setLoadingBills] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchRecentBills = async () => {
        setLoadingBills(true);
        try {
            const res = await api.get("/billing");
            if (res.data?.success) {
                setBills(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch recent bills", err);
        } finally {
            setLoadingBills(false);
        }
    };

    useEffect(() => {
        fetchRecentBills();
    }, []);

    const fetchBill = async () => {
        if (!upid) return;
        setLoading(true);
        setErrorMsg("");
        setBill(null);
        try {
            const res = await api.get(`/billing/${upid}`);
            if (res.data?.success) {
                setBill(res.data.data);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Search failed. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if(!paymentAmount || Number(paymentAmount) <= 0) return;
        const remainingDue = bill.total - bill.amountPaid;
        if(Number(paymentAmount) > remainingDue) return;
        
        setPaying(true);
        try {
            const res = await api.post('/billing/pay', { upid: upid.toUpperCase(), amount: Number(paymentAmount) });
            if (res.data?.success) {
                setPaymentAmount("");
                fetchBill();
                fetchRecentBills();
            }
        } catch (err) { 
            console.error(err);
        } finally { 
            setPaying(false); 
        }
    };

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
                        Financial <span className="text-primary italic">Terminal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Generate invoices and reconcile payments instantly.</p>
                </div>
            </div>

            {/* Notifications */}
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

            {/* Premium Search Bar */}
            <motion.div 
                variants={item}
                initial="hidden"
                animate="show"
                className="max-w-3xl mx-auto"
            >
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-[2rem] blur opacity-25 group-focus-within:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-slate-950 rounded-[2rem] p-2 flex flex-col sm:flex-row gap-2 border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Enter Patient UPID (e.g. PAT20260001)" 
                                className="w-full bg-transparent border-none py-4 pl-14 pr-6 text-base font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400 uppercase font-mono tracking-wider"
                                value={upid}
                                onChange={(e) => setUpid(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && fetchBill()}
                            />
                        </div>
                        <button 
                            onClick={fetchBill}
                            disabled={loading || !upid}
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 rounded-[1.5rem] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Reconciling..." : (
                                <>
                                    Search Records
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Bill Info Display */}
            <AnimatePresence mode="wait">
                {bill ? (
                    <motion.div 
                        key={bill.upid}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="max-w-5xl mx-auto space-y-8"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Consultations", value: bill.consultationFee, icon: ReceiptText, color: "text-blue-500", bg: "bg-blue-500/10" },
                                { label: "Laboratory", value: bill.labTotal, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                                { label: "Pharmacy", value: bill.medicineTotal, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            ].map((card, idx) => (
                                <motion.div key={idx} variants={item} className="glass-card p-6 border border-slate-200/50 dark:border-white/10 group hover:border-primary/30 transition-all shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                                            <card.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{card.label}</span>
                                    </div>
                                    <div className="text-3xl font-outfit font-bold text-slate-900 dark:text-white">₹{card.value?.toLocaleString()}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detailed Invoice */}
                        <motion.div variants={item} className="glass-card overflow-hidden border border-slate-200 dark:border-white/10">
                            <div className="p-10 space-y-10">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                                            Medical Receipt
                                        </div>
                                        <h2 className="text-3xl font-outfit font-bold text-slate-900 dark:text-white">Patient Invoice</h2>
                                        <p className="text-slate-500 text-sm font-medium">Patient ID: <span className="text-slate-900 dark:text-white font-bold font-mono">{bill.upid}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors rounded-xl border border-slate-200 dark:border-slate-700">
                                            <Printer className="w-5 h-5" />
                                        </button>
                                        <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors rounded-xl border border-slate-200 dark:border-slate-700">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Totals */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-slate-500 font-medium">Subtotal Billed</span>
                                            <span className="text-slate-900 dark:text-white font-bold">₹{bill.total?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-slate-500 font-medium">Reconciled Amount</span>
                                            <span className="text-emerald-500 font-bold">₹{bill.amountPaid?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Balance</p>
                                                <h4 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">₹{(bill.total - bill.amountPaid).toLocaleString()}</h4>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                bill.status === "Paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                bill.status === "Partial" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                                "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                            }`}>
                                                {bill.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Payment Terminal</h4>
                                        <div className="space-y-4">
                                            {bill.status !== "Paid" && bill.total > 0 ? (
                                                <>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input 
                                                            type="number" 
                                                            placeholder="Enter reconciliation amount" 
                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:text-white"
                                                            value={paymentAmount}
                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handlePayment}
                                                        disabled={paying || !paymentAmount}
                                                        className="w-full bg-slate-900 dark:bg-primary py-4 rounded-2xl text-white font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {paying ? "Processing..." : "Authorize Payment"}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                                    </div>
                                                    <h5 className="font-bold text-slate-900 dark:text-white">Account Fully Reconciled</h5>
                                                    <p className="text-xs text-slate-500 mt-1">No further action required for this invoice.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-10"
                    >
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-slate-800">
                                 <ReceiptText className="w-12 h-12" />
                            </div>
                            <div className="max-w-xs">
                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ready to Reconcile</h3>
                                 <p className="text-slate-400 text-sm mt-2">Enter a valid Patient UPID above to pull current financial records.</p>
                            </div>
                        </div>

                        {/* Recent Bills List */}
                        <div className="max-w-5xl mx-auto space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">Recent Invoices</h3>
                            {loadingBills ? (
                                <p className="text-slate-500 text-center py-4">Loading invoices...</p>
                            ) : bills.length > 0 ? (
                                <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/10 rounded-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient UPID</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Amount</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount Paid</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bills.map((b) => (
                                                    <tr key={b._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                                        <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white text-sm">{b.upid}</td>
                                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium text-sm">{b.patientId?.name || "Unknown"}</td>
                                                        <td className="py-4 px-6 text-slate-900 dark:text-white font-bold text-right">₹{b.totalAmount?.toLocaleString()}</td>
                                                        <td className="py-4 px-6 text-emerald-500 font-medium text-right">₹{b.amountPaid?.toLocaleString()}</td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                                b.status === "Paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                                b.status === "Partial" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                                                "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                            }`}>
                                                                {b.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button 
                                                                onClick={() => {
                                                                    setUpid(b.upid);
                                                                    // We can directly call fetchBill after state update with a small delay or use useEffect
                                                                    setTimeout(() => {
                                                                        const fetchBillByUpid = async () => {
                                                                            setLoading(true); setErrorMsg(""); setBill(null);
                                                                            try {
                                                                                const res = await api.get(`/billing/${b.upid}`);
                                                                                if (res.data?.success) setBill(res.data.data);
                                                                            } catch (err) { setErrorMsg("Failed."); } finally { setLoading(false); }
                                                                        };
                                                                        fetchBillByUpid();
                                                                    }, 100);
                                                                }}
                                                                className="text-primary hover:text-primary/80 font-bold text-sm"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No recent invoices found.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}