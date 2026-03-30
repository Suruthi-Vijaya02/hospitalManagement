"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Stethoscope, 
    Clipboard, 
    Pill, 
    Beaker, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    ArrowRightCircle,
    History
} from "lucide-react";

export default function ConsultationsPage() {
    const [upid, setUpid] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [medicines, setMedicines] = useState([]);
    
    const [availableMedicines, setAvailableMedicines] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState("");
    const [quantity, setQuantity] = useState("");
    
    // Lab Tests States
    const [availableTests, setAvailableTests] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState("");
    const [labTests, setLabTests] = useState([]);

    const [loading, setLoading] = useState(false);
    
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Fetch master inventory and master lab tests
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const res = await api.get("/medicine");
                if (res.data?.success) setAvailableMedicines(res.data.data);
            } catch (err) { console.error(err); }
        };
        const fetchTests = async () => {
            try {
                const res = await api.get("/lab/tests");
                if (res.data?.success) setAvailableTests(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchMedicines();
        fetchTests();
    }, []);

    const handleAddMedicine = () => {
        if (!selectedMedicine || !quantity || Number(quantity) <= 0) return;
        const existing = medicines.find(m => m.name === selectedMedicine);
        if (existing) {
            setMedicines(medicines.map(m => m.name === selectedMedicine ? { ...m, quantity: m.quantity + Number(quantity) } : m));
        } else {
            setMedicines([...medicines, { name: selectedMedicine, quantity: Number(quantity) }]);
        }
        setSelectedMedicine("");
        setQuantity("");
    };

    const handleRemoveMedicine = (name) => {
        setMedicines(medicines.filter(m => m.name !== name));
    };

    const handleAddTest = () => {
        if (!selectedTestId) return;
        const testObj = availableTests.find(t => t._id === selectedTestId);
        if (!testObj) return;
        if (!labTests.some(t => t._id === testObj._id)) {
            setLabTests([...labTests, testObj]);
        }
        setSelectedTestId("");
    };

    const handleRemoveTest = (id) => {
        setLabTests(labTests.filter(t => t._id !== id));
    };

    const submitConsultation = async () => {
        setErrorMsg("");
        setSuccessMsg("");
        if (!upid || !diagnosis) {
            setErrorMsg("UPID and Diagnosis are required!");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/consultations", { upid, diagnosis, medicines, labTests });
            if (res.data?.success) {
                setSuccessMsg("Consultation finalized successfully.");
                setUpid(""); setDiagnosis(""); setMedicines([]); setLabTests([]);
                setTimeout(() => setSuccessMsg(""), 5000);
            }
        } catch (err) {
            setErrorMsg("Error finalizing consultation.");
        } finally {
            setLoading(false);
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">
                        Consultation <span className="text-primary italic">Desk</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Finalize patient diagnosis and issue prescriptions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        <History className="w-4 h-4" />
                        Patient History
                    </button>
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
                {successMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-xl shadow-emerald-500/5 mx-2"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                
                {/* Left: Diagnosis & Basic Info (Col 1-3) */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-3 space-y-8"
                >
                    <motion.div variants={item} className="glass-card p-8 border border-slate-200/50 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Clipboard className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Primary Diagnosis</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Patient UPID</label>
                                <input 
                                    placeholder="Enter UPID (e.g. PAT20260001)"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-primary/20 transition-all outline-none uppercase placeholder:normal-case shadow-inner" 
                                    value={upid} 
                                    onChange={(e) => setUpid(e.target.value.toUpperCase())} 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Diagnosis Notes</label>
                                <textarea 
                                    placeholder="Describe symptoms, observations, and initial assessment..."
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none h-64 resize-none shadow-inner" 
                                    value={diagnosis} 
                                    onChange={(e) => setDiagnosis(e.target.value)} 
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right: Prescriptions (Col 4-5) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Medicines */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 border border-slate-200/50 dark:border-white/10"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/10 rounded-xl">
                                    <Pill className="w-5 h-5 text-rose-500" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Medicines</h2>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <select 
                                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 transition-all outline-none appearance-none cursor-pointer"
                                value={selectedMedicine} 
                                onChange={(e) => setSelectedMedicine(e.target.value)}
                            >
                                <option value="">Select Drug</option>
                                {availableMedicines.map((med) => (
                                    <option key={med._id} value={med.medicineName}>{med.medicineName} ({med.stock} left)</option>
                                ))}
                            </select>
                            <input 
                                type="number"
                                placeholder="Qty"
                                className="w-20 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                            />
                            <button 
                                onClick={handleAddMedicine}
                                className="p-3.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {medicines.map((m, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">x{m.quantity}</span>
                                        </div>
                                        <button onClick={() => handleRemoveMedicine(m.name)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Lab Tests */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-8 border border-slate-200/50 dark:border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <Beaker className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lab Investigations</h2>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <select 
                                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none cursor-pointer"
                                value={selectedTestId} 
                                onChange={(e) => setSelectedTestId(e.target.value)}
                            >
                                <option value="">Select Lab Test</option>
                                {availableTests.map((t) => (
                                    <option key={t._id} value={t._id}>{t.name} (₹{t.price})</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleAddTest}
                                className="p-3.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {labTests.map((t, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"
                                    >
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</span>
                                        <button onClick={() => handleRemoveTest(t._id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <button 
                        onClick={submitConsultation}
                        disabled={loading || !upid || !diagnosis}
                        className="w-full bg-primary hover:bg-primary text-white font-bold py-5 rounded-3xl transition-all shadow-xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-3 text-lg group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {loading ? "Finalizing..." : (
                            <>
                                Finalize Consultation
                                <ArrowRightCircle className="w-6 h-6" />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </motion.div>
    );
}