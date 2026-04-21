"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ReceiptText,
    CreditCard,
    Download,
    Printer,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Plus,
    Loader2,
    ArrowRight,
    FileText,
    History as HistoryIcon,
    Stethoscope,
    Beaker,
    ShoppingBag,
    Hotel,
    Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingPage() {
    const [upid, setUpid] = useState("");
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paying, setPaying] = useState(false);
    const [bills, setBills] = useState([]);
    const [loadingBills, setLoadingBills] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [miscForm, setMiscForm] = useState({ description: "", amount: "" });
    const [showMiscModal, setShowMiscModal] = useState(false);
    const [addingMisc, setAddingMisc] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [patients, setPatients] = useState([]);
    const [showPatientList, setShowPatientList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRecentBills = async () => {
        setLoadingBills(true);
        try {
            const res = await api.get("/billing");
            if (res.data?.success) setBills(res.data.data);
        } catch (err) {
            console.error("Failed to fetch recent bills", err);
        } finally {
            setLoadingBills(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await api.get("/patients");
            if (res.data?.success) setPatients(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchRecentBills();
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.upid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePatientSelect = (patient) => {
        setUpid(patient.upid);
        setSearchTerm(`${patient.name} (${patient.upid})`);
        setShowPatientList(false);
        fetchBill(patient.upid);
    };

    const fetchBill = async (overrideUpid = null) => {
        const targetUpid = overrideUpid || upid;
        if (!targetUpid) return;
        setLoading(true);
        setErrorMsg("");
        setBill(null);
        try {
            const res = await api.get(`/billing/${targetUpid}`);
            if (res.data?.success) setBill(res.data.data);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Reconciliation failed. Check UPID.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!paymentAmount || Number(paymentAmount) <= 0) return;
        const remainingDue = bill.total - bill.amountPaid;
        if (Number(paymentAmount) > remainingDue) return;

        setPaying(true);
        try {
            const res = await api.post('/billing/pay', { upid: bill.upid, amount: Number(paymentAmount) });
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

    const handleAddMisc = async () => {
        if (!miscForm.description || !miscForm.amount) return;
        setAddingMisc(true);
        try {
            const res = await api.post('/billing/misc', {
                upid: bill.upid,
                description: miscForm.description,
                amount: Number(miscForm.amount)
            });
            if (res.data?.success) {
                setMiscForm({ description: "", amount: "" });
                setShowMiscModal(false);
                fetchBill();
                fetchRecentBills();
            }
        } catch (err) {
            alert("Failed to add charge: " + (err.response?.data?.message || "Internal error"));
        } finally {
            setAddingMisc(false);
        }
    };

    const handlePrint = async () => {
        if (!bill) return;
        setPrinting(true);
        try {
            const res = await api.get(`/billing/${bill.upid}/print`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${bill.upid}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black tracking-widest text-[10px]">
                            FINANCIAL UNIT
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Gateway: Secure</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Account <span className="text-primary font-black">Reconciliation</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Manage clinical invoices, itemized ledger entries, and financial settlement.</p>
                </div>
            </div>

            {/* Reconciliation Search Bar */}
            <Card className="p-2 border-slate-300 shadow-xl relative z-[50] overflow-visible">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Enter Patient UPID or Name for Account Retrieval..."
                            className="h-14 pl-12 pr-6 border-none shadow-none focus-visible:ring-0 text-base font-bold dark:text-white placeholder:font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowPatientList(true);
                                if (!e.target.value) setBill(null);
                            }}
                            onFocus={() => setShowPatientList(true)}
                        />
                        <AnimatePresence>
                            {showPatientList && searchTerm && !bill && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] max-h-[350px] overflow-y-auto p-2"
                                >
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map(patient => (
                                            <Button
                                                key={patient._id}
                                                variant="ghost"
                                                onClick={() => handlePatientSelect(patient)}
                                                className="w-full h-auto p-4 justify-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{patient.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{patient.upid}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary transition-all" />
                                            </Button>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No patient records found</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <Button 
                        disabled={loading || !upid} 
                        onClick={() => fetchBill()}
                        className="h-14 px-10 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Ledger"}
                    </Button>
                </div>
            </Card>

            <AnimatePresence mode="wait">
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 font-bold text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </motion.div>
                )}

                {bill ? (
                    <motion.div key={bill.upid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Summary Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-slate-300 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Profile</span>
                                        <Badge className={`${bill.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                                            {bill.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mt-3">{bill.patientId?.name || "Patient Record"}</CardTitle>
                                    <CardDescription className="font-mono text-[11px] font-bold text-primary">{bill.upid}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Billable</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">₹{bill.total?.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Cleared</p>
                                            <p className="text-xl font-black text-emerald-500">₹{bill.amountPaid?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance Outstanding</p>
                                        <h4 className="text-4xl font-black text-rose-500 tracking-tighter">₹{(bill.total - bill.amountPaid).toLocaleString()}</h4>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <div className="flex gap-2 w-full">
                                        <Button onClick={() => setShowMiscModal(true)} variant="outline" className="flex-1 h-12 gap-2 font-bold text-[10px] uppercase tracking-widest border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white">
                                            <Plus className="w-4 h-4" /> Add Charge
                                        </Button>
                                        <Button onClick={handlePrint} disabled={printing} variant="secondary" className="w-12 h-12 p-0">
                                            {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Settlement Panel */}
                            {bill.status !== "Paid" && (
                                <Card className="p-6 border-slate-300 shadow-xl bg-slate-900 text-white">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Settlement Terminal</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Authorize Amount (₹)</label>
                                            <Input 
                                                type="number" 
                                                placeholder="0.00" 
                                                className="bg-white/5 border-white/10 h-14 font-bold text-lg text-white placeholder:text-white/20 focus-visible:ring-primary/40"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            disabled={paying || !paymentAmount} 
                                            onClick={handlePayment}
                                            className="w-full h-14 font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white transition-all shadow-2xl shadow-primary/20"
                                        >
                                            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Settlement"}
                                        </Button>
                                        <p className="text-[10px] text-center text-slate-500 font-medium">By authorizing, you confirm the receipt of physical currency or digital transfer.</p>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Detailed Ledger */}
                        <Card className="lg:col-span-8 border-slate-300 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" /> Itemized Account Ledger
                                </CardTitle>
                                <CardDescription>Consolidated statement of all medical and service expenditures.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {[
                                        { label: "Clinical Consultations", amount: bill.consultationFee, icon: Stethoscope, desc: "OPD & Diagnostic Observations" },
                                        { label: "Laboratory & Imaging", amount: bill.labTotal, icon: Beaker, desc: "Pathology and Radiology tests" },
                                        { label: "Pharmacy / Medicine", amount: bill.medicineTotal, icon: ShoppingBag, desc: "Prescription drugs and consumables" },
                                        { label: "In-Patient (IPD)", amount: bill.ipdTotal, icon: Hotel, desc: "Bed charges and ward services", highlight: true },
                                        { label: "Miscellaneous Services", amount: bill.miscTotal, icon: Zap, desc: "Extra charges added manually" },
                                    ].map((item, i) => (
                                        <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary transition-colors ${item.highlight ? "text-amber-500" : ""}`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
                                                </div>
                                            </div>
                                            <p className={`text-lg font-black ${item.highlight ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>₹{item.amount?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Billed to Patient Account</p>
                                        </div>
                                        <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{bill.total?.toLocaleString()}</h4>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                        {/* Placeholder State */}
                        {!loading && !searchTerm && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-800 mb-6">
                                    <ReceiptText className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Ledger Terminal Idle</h3>
                                <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs">Scan or enter a Patient UPID to synchronize financial records and process reconciliation.</p>
                            </div>
                        )}

                        {/* Recent History Table */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                                    <HistoryIcon className="w-3 h-3" /> Recent Reconciliation History
                                </h3>
                            </div>
                            <Card className="border-slate-300 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical ID</th>
                                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Name</th>
                                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aggregated Total</th>
                                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cleared</th>
                                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Status</th>
                                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ledger</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {loadingBills ? (
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={i}><td colSpan="6" className="p-8"><Skeleton className="h-6 w-full" /></td></tr>
                                                ))
                                            ) : bills.map((b) => (
                                                <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                                    <td className="py-5 px-8 font-mono font-bold text-primary text-xs">{b.upid}</td>
                                                    <td className="py-5 px-8 text-slate-700 dark:text-slate-300 font-bold text-sm">{b.patientId?.name || "REDACTED"}</td>
                                                    <td className="py-5 px-8 text-slate-900 dark:text-white font-black text-sm text-right">₹{b.totalAmount?.toLocaleString()}</td>
                                                    <td className="py-5 px-8 text-emerald-600 font-bold text-sm text-right">₹{b.amountPaid?.toLocaleString()}</td>
                                                    <td className="py-5 px-8 text-center">
                                                        <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest ${
                                                            b.status === "Paid" ? "border-emerald-500 text-emerald-500" : "border-rose-500 text-rose-500"
                                                        }`}>
                                                            {b.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-5 px-8 text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-primary hover:bg-primary/10 font-black text-[10px] uppercase tracking-widest"
                                                            onClick={() => { setSearchTerm(b.upid); fetchBill(b.upid); }}
                                                        >
                                                            Audit <ArrowRight className="w-3 h-3 ml-2" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Miscellaneous Charge Modal - High End */}
            <AnimatePresence>
                {showMiscModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg">
                            <Card className="border-slate-800 bg-slate-900 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                <div className="h-2 w-full bg-rose-500" />
                                <CardHeader className="p-8">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                        <Plus className="w-6 h-6 text-rose-500" /> Authorized Manual Charge
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">Append a manual expenditure to the patient's itemized ledger.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Service Description</label>
                                        <Input 
                                            placeholder="e.g. Nursing Care / Consumables" 
                                            className="bg-white/5 border-white/10 h-14 font-bold text-white placeholder:text-white/20"
                                            value={miscForm.description}
                                            onChange={(e) => setMiscForm({ ...miscForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Charge Amount (₹)</label>
                                        <Input 
                                            type="number" 
                                            placeholder="0" 
                                            className="bg-white/5 border-white/10 h-14 font-bold text-white placeholder:text-white/20"
                                            value={miscForm.amount}
                                            onChange={(e) => setMiscForm({ ...miscForm, amount: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 pt-0 flex gap-4">
                                    <Button variant="ghost" onClick={() => setShowMiscModal(false)} className="flex-1 h-14 font-bold text-slate-500">Cancel</Button>
                                    <Button 
                                        disabled={addingMisc || !miscForm.description || !miscForm.amount} 
                                        onClick={handleAddMisc}
                                        className="flex-1 h-14 font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20"
                                    >
                                        {addingMisc ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Charge"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}