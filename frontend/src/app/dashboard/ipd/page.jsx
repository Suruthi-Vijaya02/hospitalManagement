"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Hotel, 
    Plus, 
    Search, 
    Filter, 
    UserPlus, 
    LogOut, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Activity,
    Bed as BedIcon,
    LayoutGrid,
    Users,
    Stethoscope,
    DoorOpen,
    ShieldAlert
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CustomSelect from "@/components/common/CustomSelect";

export default function IPDPage() {
    const { user } = useAuthStore();
    const [beds, setBeds] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showAddBedModal, setShowAddBedModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [admissionForm, setAdmissionForm] = useState({ upid: "", reason: "" });
    const [bedForm, setBedForm] = useState({ bedNumber: "", wardType: "General", pricePerDay: "" });
    const [admitting, setAdmitting] = useState(false);
    const [savingBed, setSavingBed] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showPatientList, setShowPatientList] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bedsRes, patientsRes] = await Promise.all([
                api.get("/ipd/beds"),
                api.get("/patients")
            ]);
            if (bedsRes.data?.success) setBeds(bedsRes.data.data);
            if (patientsRes.data?.success) setPatients(patientsRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredPatients = patients.filter(p => 
        p.upid.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const wards = ["All", "General", "Semi-Private", "Private", "ICU", "Emergency"];

    const filteredBeds = activeTab === "All" 
        ? beds 
        : beds.filter(b => b.wardType === activeTab);

    const handleAdmit = async () => {
        if (!admissionForm.upid || !admissionForm.reason) {
            setError("Protocol failure: Patient identifier and clinical reason required.");
            return;
        }
        setAdmitting(true);
        setError("");
        try {
            await api.post("/ipd/admissions/admit", {
                upid: admissionForm.upid,
                bedId: selectedBed._id,
                reason: admissionForm.reason
            });
            setShowAdmitModal(false);
            setAdmissionForm({ upid: "", reason: "" });
            setSearchTerm("");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Admission synchronization failed.");
        } finally {
            setAdmitting(false);
        }
    };

    const handleAddBed = async () => {
        if (!bedForm.bedNumber || !bedForm.pricePerDay) {
            setError("Resource allocation failure: Missing metadata.");
            return;
        }
        setSavingBed(true);
        setError("");
        try {
            await api.post("/ipd/beds", bedForm);
            setShowAddBedModal(false);
            setBedForm({ bedNumber: "", wardType: "General", pricePerDay: "" });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Bed registration failed.");
        } finally {
            setSavingBed(false);
        }
    };

    const handleDischarge = async (bed) => {
        if (!confirm(`Authorize clinical discharge for Bed ${bed.bedNumber}?`)) return;
        
        try {
            const activeAdmissions = await api.get("/ipd/admissions/active");
            const admission = activeAdmissions.data.data.find(a => 
                a.bedId?._id?.toString() === bed._id?.toString() || 
                a.bedId?.toString() === bed._id?.toString()
            );
            
            if (admission) {
                await api.post("/ipd/admissions/discharge", { admissionId: admission._id });
                fetchData();
            } else {
                alert("Clinical synchronization error: No active record found.");
            }
        } catch (err) {
            alert("Discharge protocol failed: " + (err.response?.data?.message || "Internal error."));
        }
    };

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black tracking-widest text-[10px]">
                            IN-PATIENT CARE
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wards: Active Monitoring</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Ward <span className="text-primary font-black">Occupancy</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Manage bed allocation, patient admissions, and ward rotation logistics.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Card className="px-6 py-3 border-slate-300 bg-white/50 dark:bg-slate-900/50 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Available</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{beds.filter(b => b.status === "Available").length}</span>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Occupied</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{beds.filter(b => b.status === "Occupied").length}</span>
                            </div>
                        </div>
                    </Card>
                    {user?.role === "Admin" && (
                        <Button onClick={() => setShowAddBedModal(true)} className="h-12 gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-xl shadow-primary/20">
                            <Plus className="w-4 h-4" /> Add Bed Resource
                        </Button>
                    )}
                </div>
            </div>

            {/* Ward Navigation */}
            <Card className="p-2 border-slate-300 shadow-xl overflow-visible">
                <div className="flex flex-wrap gap-2">
                    {wards.map(ward => (
                        <Button
                            key={ward}
                            variant={activeTab === ward ? "default" : "ghost"}
                            onClick={() => setActiveTab(ward)}
                            className={`h-12 px-6 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === ward ? "shadow-lg shadow-primary/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                        >
                            {ward} Wards
                        </Button>
                    ))}
                </div>
            </Card>

            {/* Bed Matrix Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                        <LayoutGrid className="w-3 h-3" /> Real-Time Clinical Bed Matrix
                    </h3>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredBeds.map((bed) => {
                            const isOccupied = bed.status === "Occupied";
                            const isMaintenance = bed.status === "Maintenance";
                            return (
                                <motion.div key={bed._id} whileHover={{ y: -5 }} onClick={() => {
                                    if (!isOccupied && !isMaintenance) {
                                        setSelectedBed(bed);
                                        setShowAdmitModal(true);
                                    } else if (isOccupied) {
                                        handleDischarge(bed);
                                    }
                                }}>
                                    <Card className={`h-full border-2 transition-all cursor-pointer overflow-hidden relative group ${
                                        isOccupied ? "border-rose-500/20 bg-rose-500/[0.02]" : 
                                        isMaintenance ? "border-amber-500/20 bg-amber-500/[0.02]" : 
                                        "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-primary/50"
                                    }`}>
                                        <div className={`h-1 w-full ${isOccupied ? "bg-rose-500" : isMaintenance ? "bg-amber-500" : "bg-emerald-500"}`} />
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="font-mono text-[9px] font-bold text-slate-500 border-slate-200 dark:border-slate-800">
                                                    #{bed.bedNumber}
                                                </Badge>
                                                <div className={`w-2 h-2 rounded-full ${isOccupied ? "bg-rose-500 animate-pulse" : isMaintenance ? "bg-amber-500" : "bg-emerald-500"}`} />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-2 flex flex-col items-center text-center space-y-4">
                                            <div className={`p-4 rounded-2xl ${isOccupied ? "bg-rose-500/10 text-rose-500" : isMaintenance ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"} transition-colors group-hover:bg-primary group-hover:text-white`}>
                                                <BedIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">{bed.wardType} Ward</h4>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">₹{bed.pricePerDay}/Day</p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-auto min-h-[60px] flex flex-col justify-center">
                                            {isOccupied ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                                        <Activity className="w-4 h-4 text-rose-500" />
                                                    </div>
                                                    <div className="text-left overflow-hidden">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase leading-none">In-Patient</p>
                                                        <p className="text-[10px] font-bold text-rose-500 truncate">{bed.currentPatientId?.name || "REDACTED"}</p>
                                                    </div>
                                                </div>
                                            ) : isMaintenance ? (
                                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center w-full">Under Maintenance</p>
                                            ) : (
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center w-full group-hover:text-primary transition-colors">Available for Intake</p>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Admission Protocol Modal */}
            <AnimatePresence>
                {showAdmitModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg">
                            <Card className="border-slate-800 bg-slate-900 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                <div className="h-2 w-full bg-primary" />
                                <CardHeader className="p-10 pb-6">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                        <UserPlus className="w-7 h-7 text-primary" /> Admission Protocol
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">Authorize clinical intake for Bed #{selectedBed?.bedNumber} ({selectedBed?.wardType}).</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identify Patient</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <Input placeholder="Search UPID or Name..." className="bg-white/5 border-white/10 h-14 pl-12 font-bold text-white placeholder:text-white/20" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowPatientList(true); }} onFocus={() => setShowPatientList(true)} />
                                            <AnimatePresence>
                                                {showPatientList && searchTerm && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-[calc(100%+8px)] left-0 right-0 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                                                        {filteredPatients.map(p => (
                                                            <Button key={p._id} variant="ghost" onClick={() => { setAdmissionForm({ ...admissionForm, upid: p.upid }); setSearchTerm(`${p.name} (${p.upid})`); setShowPatientList(false); }} className="w-full h-auto p-3 justify-start gap-4 hover:bg-white/5 text-white">
                                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-[10px]">{p.name.charAt(0)}</div>
                                                                <div className="text-left">
                                                                    <p className="font-bold text-sm">{p.name}</p>
                                                                    <p className="text-[10px] font-mono opacity-50">{p.upid}</p>
                                                                </div>
                                                            </Button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clinical Reason</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-24 font-bold text-white outline-none focus:ring-2 focus:ring-primary/40" placeholder="State reason for hospitalization..." value={admissionForm.reason} onChange={(e) => setAdmissionForm({ ...admissionForm, reason: e.target.value })} />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 pt-0 flex gap-4">
                                    <Button variant="ghost" onClick={() => setShowAdmitModal(false)} className="flex-1 h-14 font-bold text-slate-500">Cancel</Button>
                                    <Button disabled={admitting || !admissionForm.upid} onClick={handleAdmit} className="flex-1 h-14 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                                        {admitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Admission"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Bed Modal */}
            <AnimatePresence>
                {showAddBedModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg">
                            <Card className="border-slate-800 bg-slate-900 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                <div className="h-2 w-full bg-slate-100" />
                                <CardHeader className="p-10 pb-6">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                        <DoorOpen className="w-7 h-7 text-slate-100" /> Resource Allocation
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">Register a new medical bed resource into the hospital facility database.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bed Identifier</label>
                                            <Input placeholder="e.g. ICU-05" className="bg-white/5 border-white/10 h-14 font-bold text-white placeholder:text-white/20" value={bedForm.bedNumber} onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <CustomSelect 
                                                label="Ward Category"
                                                options={wards.filter(w => w !== "All")}
                                                value={bedForm.wardType}
                                                onChange={(val) => setBedForm({ ...bedForm, wardType: val })}
                                                variant="dark"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Daily Utilization Fee (₹)</label>
                                        <Input type="number" placeholder="Daily Cost" className="bg-white/5 border-white/10 h-14 font-bold text-white placeholder:text-white/20" value={bedForm.pricePerDay} onChange={(e) => setBedForm({ ...bedForm, pricePerDay: e.target.value })} />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 pt-0 flex gap-4">
                                    <Button variant="ghost" onClick={() => setShowAddBedModal(false)} className="flex-1 h-14 font-bold text-slate-500">Cancel</Button>
                                    <Button disabled={savingBed} onClick={handleAddBed} className="flex-1 h-14 font-black uppercase tracking-widest bg-slate-100 text-slate-900 hover:bg-white shadow-xl shadow-white/10">
                                        {savingBed ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalize Allocation"}
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
