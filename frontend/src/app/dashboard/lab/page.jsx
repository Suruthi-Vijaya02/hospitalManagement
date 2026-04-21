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
    Eye,
    TestTube2,
    Microscope,
    FlaskConical,
    Loader2,
    Activity,
    FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function LabPage() {
    const [upid, setUpid] = useState("");
    const [availableTests, setAvailableTests] = useState([]);
    const [selectedTestIds, setSelectedTestIds] = useState([]);
    const [patientLabs, setPatientLabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [newTestName, setNewTestName] = useState("");
    const [newTestPrice, setNewTestPrice] = useState("");
    const [uploadingTestId, setUploadingTestId] = useState(null);
    const [patients, setPatients] = useState([]);
    const [showPatientList, setShowPatientList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPatientLabs = async (overrideUpid = null) => {
        const targetUpid = overrideUpid || upid;
        if (!targetUpid) {
            fetchLabQueue();
            return;
        }
        setFetching(true);
        try {
            const res = await api.get(`/lab/${targetUpid}`);
            if (res.data?.success) setPatientLabs(res.data.data);
        } catch (err) { console.error(err); }
        finally { setFetching(false); }
    };

    const fetchLabQueue = async () => {
        setFetching(true);
        try {
            const res = await api.get("/lab/queue");
            if (res.data?.success) setPatientLabs(res.data.data);
        } catch (err) { console.error(err); }
        finally { setFetching(false); }
    };

    const fetchPatients = async () => {
        try {
            const res = await api.get("/patients");
            if (res.data?.success) setPatients(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await api.get("/lab/tests");
                if (res.data?.success) setAvailableTests(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchTests();
        fetchLabQueue();
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
        fetchPatientLabs(patient.upid);
    };

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

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black tracking-widest text-[10px]">
                            DIAGNOSTIC UNIT
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lab Terminal: Online</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Laboratory <span className="text-primary font-black">Investigations</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Process diagnostic requests, manage report uploads, and track clinical investigations.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Card className="px-6 py-3 border-slate-300 bg-white/50 dark:bg-slate-900/50 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Pending</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{patientLabs.filter(l => l.tests.some(t => t.status === "Pending")).length}</span>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Released</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{patientLabs.filter(l => l.tests.every(t => t.status === "Completed")).length}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Investigation Registry */}
                <div className="lg:col-span-5 space-y-8">
                    
                    {/* Patient Search */}
                    <Card className="p-2 border-slate-300 shadow-xl relative z-[50] overflow-visible">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search Patient UPID for Investigation..."
                                className="h-14 pl-12 pr-6 border-none shadow-none focus-visible:ring-0 text-base font-bold dark:text-white placeholder:font-medium placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowPatientList(true);
                                    if (!e.target.value) setUpid("");
                                }}
                                onFocus={() => setShowPatientList(true)}
                            />
                            <AnimatePresence>
                                {showPatientList && searchTerm && !upid && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] max-h-[350px] overflow-y-auto p-2">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(p => (
                                                <Button key={p._id} variant="ghost" onClick={() => handlePatientSelect(p)} className="w-full h-auto p-4 justify-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl group text-left">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">{p.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{p.name}</p>
                                                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{p.upid}</p>
                                                    </div>
                                                </Button>
                                            ))
                                        ) : <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Patient not found</div>}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>

                    {/* Investigation Catalogue */}
                    <Card className="border-slate-300 shadow-sm">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-primary" /> Test Catalogue
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {/* Add Modal */}}>
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>Select investigations to be registered for {upid || 'selected patient'}.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableTests.map((test) => {
                                    const isSelected = selectedTestIds.includes(test._id);
                                    return (
                                        <div 
                                            key={test._id} 
                                            onClick={() => toggleTestSelection(test._id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                isSelected 
                                                    ? "border-primary bg-primary/5 shadow-inner" 
                                                    : "border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                                            }`}
                                        >
                                            <p className={`text-xs font-black uppercase tracking-tight ${isSelected ? "text-primary" : "text-slate-700 dark:text-slate-300"}`}>{test.name}</p>
                                            <p className={`text-[10px] font-bold mt-1 ${isSelected ? "text-primary/60" : "text-slate-400"}`}>₹{test.price}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <Button 
                                disabled={loading || selectedTestIds.length === 0 || !upid} 
                                onClick={submitLabRequest}
                                className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Register Request (${selectedTestIds.length})`}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Master Test Addition */}
                    <Card className="p-6 border-slate-300 bg-slate-900 text-white">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Catalogue Management</h3>
                        <div className="flex gap-3">
                            <Input placeholder="Test Name" className="bg-white/5 border-white/10 h-12 text-white text-xs font-bold" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} />
                            <Input placeholder="₹" type="number" className="w-24 bg-white/5 border-white/10 h-12 text-white text-xs font-bold" value={newTestPrice} onChange={(e) => setNewTestPrice(e.target.value)} />
                            <Button onClick={handleAddMasterTest} className="h-12 w-12 p-0 bg-primary hover:bg-primary/90"><Plus className="w-5 h-5" /></Button>
                        </div>
                    </Card>
                </div>

                {/* Right: Diagnostic Pipeline */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                            <History className="w-3 h-3" /> Diagnostic Pipeline
                        </h3>
                        {upid && <Button variant="ghost" size="sm" onClick={() => { setUpid(""); fetchLabQueue(); }} className="text-[10px] font-black text-primary uppercase">Exit Patient View</Button>}
                    </div>

                    <div className="space-y-6 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                        {fetching ? (
                            [...Array(3)].map((_, i) => <Card key={i} className="p-8 border-slate-200/60"><Skeleton className="h-32 w-full" /></Card>)
                        ) : patientLabs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                                <Beaker className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-6" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Pipeline Clear</h3>
                                <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs">No active investigations are currently registered in the diagnostic queue.</p>
                            </div>
                        ) : (
                            patientLabs.map((lab) => (
                                <Card key={lab._id} className="border-slate-300 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {lab._id.slice(-6).toUpperCase()}</span>
                                                    <Badge className="bg-primary/5 text-primary border-primary/20 font-mono text-[9px]">{lab.upid}</Badge>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{new Date(lab.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(lab.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        {lab.tests.map((test) => (
                                            <div key={test._id} className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`p-3 rounded-xl ${test.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "bg-amber-500/10 text-amber-600 dark:text-amber-500"}`}>
                                                        {test.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{test.name}</h5>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status: <span className={test.status === "Completed" ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600 dark:text-amber-500"}>{test.status}</span></p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {test.reportUrl && (
                                                        <Button variant="outline" size="sm" className="h-10 gap-2 font-bold text-[10px] uppercase border-primary/20 text-primary hover:bg-primary hover:text-white" asChild>
                                                            <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/${test.reportUrl}`} target="_blank" rel="noreferrer">
                                                                <FileText className="w-3 h-3" /> Report Published
                                                            </a>
                                                        </Button>
                                                    )}
                                                    
                                                    {test.status === "Pending" && (
                                                        <label className={`h-10 px-4 flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:scale-[1.02] transition-all shadow-lg ${uploadingTestId === test._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            {uploadingTestId === test._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3" />}
                                                            {uploadingTestId === test._id ? 'Uploading' : 'Submit Result'}
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, lab._id, test._id)} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}