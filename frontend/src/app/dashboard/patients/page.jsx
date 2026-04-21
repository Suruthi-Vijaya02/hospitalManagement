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
    ChevronRight,
    ArrowUpRight,
    MoreVertical,
    Activity,
    Droplets,
    LayoutGrid,
    List,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CustomSelect from "@/components/common/CustomSelect";

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [form, setForm] = useState({
        name: "", age: "", gender: "Male", phone: "+91 ", address: "", 
        appointmentDate: "", appointmentTime: "", bloodGroup: "O+"
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const fetchPatients = async () => {
        setFetching(true);
        try {
            const res = await getPatients();
            if (res?.data?.data) {
                setPatients(res.data.data);
            } else if (res?.data) {
                setPatients(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedPhone = form.phone.replace(/\s/g, "");
        if (!cleanedPhone.startsWith("+91") || cleanedPhone.length < 13) {
            alert("Please enter a valid phone number with +91 country code");
            return;
        }

        setLoading(true);
        try {
            await createPatient({ ...form, phone: cleanedPhone });
            setForm({
                name: "", age: "", gender: "Male", phone: "+91 ", address: "", 
                appointmentDate: "", appointmentTime: "", bloodGroup: "O+"
            });
            setShowRegisterModal(false);
            await fetchPatients();
        } catch (error) {
            alert(error.response?.data?.message || "Patient creation failed.");
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.upid?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black tracking-widest text-[10px]">
                            PATIENT DATABASE
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol: Secure Registry</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Medical <span className="text-primary font-black">Registry</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">Manage clinical records and patient onboarding workflows.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Button 
                            variant={viewMode === "grid" ? "secondary" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode("grid")}
                            className="h-9 w-9 p-0"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant={viewMode === "list" ? "secondary" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode("list")}
                            className="h-9 w-9 p-0"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button onClick={() => setShowRegisterModal(true)} className="gap-2 font-bold text-xs h-12 px-6 shadow-xl shadow-primary/20">
                        <UserPlus className="w-4 h-4" /> New Registration
                    </Button>
                </div>
            </div>

            {/* Registry Search & Filter */}
            <Card className="p-2 border-slate-300 shadow-xl overflow-visible">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Filter by Name, Medical ID (UPID), or Phone..."
                            className="h-14 pl-12 pr-6 border-none shadow-none focus-visible:ring-0 text-base font-bold dark:text-white placeholder:font-medium placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-14 px-8 font-bold gap-2 text-slate-500 border-slate-200 dark:border-slate-800">
                        <Filter className="w-4 h-4" /> Advanced Filter
                    </Button>
                </div>
            </Card>

            {/* Patient Grid / List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                        <Users className="w-3 h-3" /> Recent Clinical Enrollments
                    </h3>
                    <span className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">{filteredPatients.length} Records Found</span>
                </div>

                <AnimatePresence mode="popLayout">
                    {fetching ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="p-6 border-slate-300"><Skeleton className="h-24 w-full" /></Card>
                            ))}
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-800 mb-6">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Record Not Found</h3>
                            <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs">Try adjusting your filter parameters or register a new patient account.</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPatients.map((p) => (
                                <motion.div key={p._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                    <Card className="p-6 border-slate-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                {p.name?.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <Badge variant="outline" className="font-mono text-[9px] font-bold text-slate-500 group-hover:text-primary transition-colors">
                                                {p.upid}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 mb-6">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate group-hover:text-primary transition-colors">{p.name}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.age}Y • {p.gender}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <div className="flex items-center gap-1">
                                                    <Droplets className="w-3 h-3 text-rose-500" />
                                                    <span className="text-[10px] font-black text-rose-500 uppercase">{p.bloodGroup}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {p.appointmentDate ? new Date(p.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Pending'}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-primary">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-slate-300 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                                            <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Identifier</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vitals</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Type</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredPatients.map((p) => (
                                            <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                                <td className="py-5 px-8 font-mono font-bold text-primary text-xs">{p.upid}</td>
                                                <td className="py-5 px-8 text-slate-900 dark:text-white font-bold text-sm">{p.name}</td>
                                                <td className="py-5 px-8 text-slate-500 font-bold text-[11px] uppercase tracking-tighter">{p.age}Y • {p.gender}</td>
                                                <td className="py-5 px-8">
                                                    <Badge variant="secondary" className="bg-rose-500/5 text-rose-500 border-rose-500/10 font-black text-[9px] uppercase tracking-widest">
                                                        {p.bloodGroup}
                                                    </Badge>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            {p.appointmentDate ? new Date(p.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Data'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{p.appointmentTime || '--:--'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-primary">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </AnimatePresence>
            </div>

            {/* Registration Protocol Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
                            <Card className="border-slate-800 bg-slate-900 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                <div className="h-2 w-full bg-primary" />
                                <CardHeader className="p-10">
                                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                                        <UserPlus className="w-8 h-8 text-primary" /> Clinical Intake Protocol
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">Initiate high-fidelity patient onboarding for the centralized medical registry.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="p-10 pt-0 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                                                <Input required placeholder="Patient Full Name" className="bg-white/5 border-white/10 h-14 font-bold text-white placeholder:text-white/20" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Contact</label>
                                                <Input required placeholder="+91 00000 00000" className="bg-white/5 border-white/10 h-14 font-bold text-white placeholder:text-white/20" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age & Gender</label>
                                                <div className="flex gap-4">
                                                    <Input required type="number" placeholder="Age" className="bg-white/5 border-white/10 h-14 font-bold text-white w-24" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                                                    <CustomSelect 
                                                        options={["Male", "Female", "Other"]}
                                                        value={form.gender}
                                                        onChange={(val) => setForm({ ...form, gender: val })}
                                                        variant="dark"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <CustomSelect 
                                                    label="Blood Group"
                                                    options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]}
                                                    value={form.bloodGroup}
                                                    onChange={(val) => setForm({ ...form, bloodGroup: val })}
                                                    variant="dark"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scheduled Date</label>
                                                <Input required type="date" className="bg-white/5 border-white/10 h-14 font-bold text-white" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scheduled Time</label>
                                                <Input required type="time" className="bg-white/5 border-white/10 h-14 font-bold text-white" value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                                            <textarea required placeholder="Full Address Details..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-24 font-bold text-white outline-none focus:ring-2 focus:ring-primary/40" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-10 pt-0 flex gap-4">
                                        <Button type="button" variant="ghost" onClick={() => setShowRegisterModal(false)} className="flex-1 h-14 font-bold text-slate-500">Cancel Protocol</Button>
                                        <Button disabled={loading} type="submit" className="flex-1 h-14 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Finalize Enrollment</>}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}