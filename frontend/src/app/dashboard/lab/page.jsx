"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Beaker, 
    Plus, 
    Search, 
    FileUp, 
    CheckCircle2, 
    Clock, 
    ChevronRight, 
    History,
    Settings,
    MoreVertical,
    Download,
    Eye
} from "lucide-react";

export default function LabPage() {
    const [upid, setUpid] = useState("");
    const [availableTests, setAvailableTests] = useState([]);
    const [selectedTestIds, setSelectedTestIds] = useState([]);
    const [patientLabs, setPatientLabs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newTestName, setNewTestName] = useState("");
    const [newTestPrice, setNewTestPrice] = useState("");
    const [uploadingTestId, setUploadingTestId] = useState(null);

    const fetchPatientLabs = async () => {
        if (!upid) {
            fetchLabQueue();
            return;
        }
        try {
            const res = await api.get(`/lab/${upid}`);
            if (res.data?.success) setPatientLabs(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchLabQueue = async () => {
        try {
            const res = await api.get("/lab/queue");
            if (res.data?.success) setPatientLabs(res.data.data);
        } catch (err) { console.error(err); }
    };

    // Fetch master lab tests and global queue on load
    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await api.get("/lab/tests");
                if (res.data?.success) setAvailableTests(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchTests();
        fetchLabQueue();
    }, []);

    const toggleTestSelection = (testId) => {
        setSelectedTestIds((prev) =>
            prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
        );
    };

    const submitLabRequest = async () => {
        if (!upid || selectedTestIds.length === 0) return;
        setLoading(true);
        try {
            const res = await api.post("/lab", { upid, testIds: selectedTestIds });
            if (res.data?.success) {
                setSelectedTestIds([]);
                fetchPatientLabs();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddMasterTest = async () => {
        if (!newTestName || !newTestPrice) return;
        try {
            const res = await api.post("/lab/tests", { name: newTestName, price: Number(newTestPrice) });
            if (res.data?.success) {
                setAvailableTests([...availableTests, res.data.data]);
                setNewTestName(""); setNewTestPrice("");
            }
        } catch (err) { console.error(err); }
    };

    const handleFileUpload = async (e, labId, testId) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("labId", labId);
        formData.append("testId", testId);
        formData.append("report", file);

        setUploadingTestId(testId);
        try {
            const res = await api.post("/lab/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data?.success) fetchPatientLabs();
        } catch (err) { console.error(err); }
        setUploadingTestId(null);
    };

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
                        Laboratory <span className="text-primary italic">Terminal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage investigations and diagnostic reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left: Configuration & Requests (Col 1-5) */}
                <div className="lg:col-span-5 space-y-8">
                    
                    {/* Master Test Panel */}
                    <motion.div 
                        variants={item}
                        initial="hidden"
                        animate="show"
                        className="glass-card p-6 border border-slate-200 dark:border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Settings className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Master Catalogue</h3>
                        </div>
                        <div className="flex gap-3">
                            <input 
                                placeholder="Investigation name" 
                                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={newTestName} 
                                onChange={(e) => setNewTestName(e.target.value)} 
                            />
                            <input 
                                placeholder="Price" 
                                type="number"
                                className="w-20 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={newTestPrice} 
                                onChange={(e) => setNewTestPrice(e.target.value)} 
                            />
                            <button 
                                onClick={handleAddMasterTest}
                                className="p-3 bg-primary text-white rounded-xl hover:bg-primary transition-all shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Lab Request Form */}
                    <motion.div 
                        variants={item}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.1 }}
                        className="glass-card p-8 border border-slate-200 dark:border-white/10"
                    >
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Patient Registration</label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        placeholder="ENTER UPID (PAT2026...)"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase shadow-inner" 
                                        value={upid} 
                                        onChange={(e) => setUpid(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchPatientLabs()}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Select Investigations</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableTests.map((test) => {
                                        const isSelected = selectedTestIds.includes(test._id);
                                        return (
                                            <motion.div
                                                key={test._id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => toggleTestSelection(test._id)}
                                                className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col gap-1 ${
                                                    isSelected
                                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                                                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                <span className={`text-xs font-bold leading-tight ${isSelected ? "text-primary" : "text-slate-700 dark:text-slate-300"}`}>
                                                    {test.name}
                                                </span>
                                                <span className={`text-[10px] font-bold ${isSelected ? "text-primary/60" : "text-slate-400"}`}>
                                                    ₹{test.price}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={submitLabRequest}
                                disabled={loading || selectedTestIds.length === 0 || !upid}
                                className="w-full bg-slate-900 dark:bg-primary text-white font-bold py-5 rounded-2xl tracking-wide shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {loading ? "Processing..." : (
                                    <>
                                        Register Request ({selectedTestIds.length})
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right: History & Reports (Col 6-12) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {upid ? `History for ${upid}` : "Active Investigation Queue"}
                            </h2>
                        </div>
                        {upid && (
                            <button 
                                onClick={() => { setUpid(""); fetchLabQueue(); }}
                                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                            >
                                View Active Queue
                            </button>
                        )}
                    </div>

                    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                        {patientLabs.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800"
                            >
                                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                     <Beaker className="w-10 h-10 text-slate-200" />
                                </div>
                                <h4 className="text-slate-900 dark:text-white font-bold">
                                    {upid ? "No records found" : "Queue is currently empty"}
                                </h4>
                                <p className="text-slate-400 text-sm mt-1 max-w-[200px] text-center">
                                    {upid ? "No diagnostic history available for this patient." : "Diagnostic requests will appear here in real-time."}
                                </p>
                            </motion.div>
                        ) : null}

                        <AnimatePresence mode="popLayout">
                            {patientLabs.map((lab) => (
                                <motion.div 
                                    key={lab._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card p-6 border border-slate-200 dark:border-white/10 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                                ID
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">REF: {lab._id.slice(-8).toUpperCase()} • {lab.upid}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(lab.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(lab.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="p-2 text-slate-300 hover:text-primary transition-colors cursor-pointer">
                                            <MoreVertical className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {lab.tests.map((test) => (
                                            <div key={test._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm group hover:border-primary/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-10 rounded-full ${test.status === "Completed" ? "bg-emerald-500" : "bg-amber-500"} shadow-sm`} />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{test.name}</h5>
                                                        <span className="text-[10px] text-slate-400 font-bold">Investigation • ₹{test.price}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {test.reportUrl && (
                                                        <a 
                                                            href={`http://localhost:5000/${test.reportUrl}`} 
                                                            target="_blank" rel="noreferrer" 
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            View Report
                                                        </a>
                                                    )}
                                                    
                                                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border ${
                                                        test.status === "Completed" 
                                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                    }`}>
                                                        {test.status === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {test.status}
                                                    </div>

                                                    {test.status === "Pending" && (
                                                        <label className={`cursor-pointer group flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-bold hover:scale-[1.02] transition-all shadow-md ${uploadingTestId === test._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            {uploadingTestId === test._id ? 'Uploading...' : (
                                                                <>
                                                                    <FileUp className="w-3 h-3" />
                                                                    Upload
                                                                </>
                                                            )}
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, lab._id, test._id)} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}