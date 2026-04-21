"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "@/store/auth.store";
import {
    CalendarDays, Plus, Search, Clock, CheckCircle2, XCircle,
    AlertCircle, Loader2, ChevronLeft, ChevronRight, User,
    Stethoscope, Filter, RefreshCcw, Calendar, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CustomSelect from "@/components/common/CustomSelect";
import api from "@/lib/axios";
import { getPatients } from "@/services/patient.service";

const DEPARTMENTS = ["General", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "ENT", "Ophthalmology", "Gynecology", "Oncology"];
const STATUS_COLORS = {
    Scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "No-Show": "bg-amber-500/10 text-amber-600 border-amber-500/20",
};
const STATUS_DOT = {
    Scheduled: "bg-blue-500",
    Completed: "bg-emerald-500",
    Cancelled: "bg-rose-500",
    "No-Show": "bg-amber-500",
};
const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
}

export default function AppointmentsPage() {
    const { user } = useAuthStore();
    const isDoctor = user?.role === "Doctor";
    const isReceptionist = user?.role === "Receptionist" || user?.role === "Admin";

    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDept, setFilterDept] = useState("All");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [patientSearch, setPatientSearch] = useState("");
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const [form, setForm] = useState({
        upid: "", patientName: "",
        // If Doctor, pre-fill their own name and lock it
        doctorName: isDoctor ? (user?.name || "") : "",
        department: "General",
        appointmentDate: new Date().toISOString().split("T")[0],
        appointmentTime: "09:00", reason: ""
    });

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get("/appointments", {
                params: { date: selectedDate }
            });
            if (res.data?.success) setAppointments(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await getPatients();
            setPatients(res.data?.data || res.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchAppointments(); }, [selectedDate]);
    useEffect(() => { fetchPatients(); }, []);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.upid.toLowerCase().includes(patientSearch.toLowerCase())
    );

    // Doctor only sees THEIR OWN appointments; Receptionist/Admin sees ALL
    const visibleAppointments = isDoctor
        ? appointments.filter(a => a.doctorName?.toLowerCase() === user?.name?.toLowerCase())
        : appointments;

    const filteredAppointments = visibleAppointments.filter(a => {
        const matchSearch = a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.upid?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "All" || a.status === filterStatus;
        const matchDept = filterDept === "All" || a.department === filterDept;
        return matchSearch && matchStatus && matchDept;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.upid) { alert("Please select a patient."); return; }
        setSubmitting(true);
        try {
            await api.post("/appointments", form);
            setShowModal(false);
            setForm({
                upid: "", patientName: "",
                doctorName: isDoctor ? (user?.name || "") : "",
                department: "General",
                appointmentDate: new Date().toISOString().split("T")[0],
                appointmentTime: "09:00", reason: ""
            });
            setPatientSearch("");
            await fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to book appointment.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        try {
            await api.put(`/appointments/${id}/status`, { status });
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
        } catch (err) {
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const navigateDate = (dir) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + dir);
        setSelectedDate(d.toISOString().split("T")[0]);
    };

    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === "Scheduled").length,
        completed: appointments.filter(a => a.status === "Completed").length,
        cancelled: appointments.filter(a => a.status === "Cancelled").length,
    };

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black tracking-widest text-[10px]">
                            {isDoctor ? "MY SCHEDULE" : "SCHEDULING SYSTEM"}
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isDoctor ? `Dr. ${user?.name} · Personal View` : "All Doctors · Full View"}
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                        {isDoctor ? "My" : "Appointment"} <span className="text-primary font-black">{isDoctor ? "Schedule" : "Scheduler"}</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                        {isDoctor
                            ? `Showing only your appointments, Dr. ${user?.name}.`
                            : "Manage patient appointments, track status, and coordinate doctor schedules."
                        }
                    </p>
                </div>
                <Button onClick={() => setShowModal(true)} className="gap-2 font-bold text-xs h-12 px-6 shadow-xl shadow-primary/20">
                    <Plus className="w-4 h-4" /> {isDoctor ? "Book for My Patient" : "Book Appointment"}
                </Button>
            </div>

            {/* Date Navigator */}
            <Card className="border-slate-300 shadow-sm p-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <button onClick={() => navigateDate(-1)} className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-50 hover:border-primary/30 transition-all">
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <div className="flex-1 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selected Date</p>
                            <h2 className="text-lg font-black text-slate-900">{formatDate(selectedDate)}</h2>
                        </div>
                        <button onClick={() => navigateDate(1)} className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-50 hover:border-primary/30 transition-all">
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    />
                    <button onClick={fetchAppointments} className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all">
                        <RefreshCcw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </Card>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: isDoctor ? "My Patients Today" : "Total Booked", value: filteredAppointments.length, icon: CalendarDays, color: "text-slate-900", bg: "bg-slate-100" },
                    { label: "Scheduled", value: filteredAppointments.filter(a => a.status === "Scheduled").length, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Completed", value: filteredAppointments.filter(a => a.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Cancelled", value: filteredAppointments.filter(a => a.status === "Cancelled").length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className="border-slate-300 p-5">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filter Bar — Doctor sees simpler filters, no doctor search needed */}
            <Card className="border-slate-300 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder={isDoctor ? "Search by patient name or UPID..." : "Search by patient, doctor, or UPID..."}
                            className="pl-11 h-11 border-slate-300 bg-slate-50 font-medium text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <CustomSelect
                        options={["All", "Scheduled", "Completed", "Cancelled", "No-Show"]}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        variant="light"
                        className="w-44"
                    />
                    {/* Dept filter only for receptionist/admin since doctor only sees their dept */}
                    {isReceptionist && (
                        <CustomSelect
                            options={["All", ...DEPARTMENTS]}
                            value={filterDept}
                            onChange={setFilterDept}
                            variant="light"
                            className="w-44"
                        />
                    )}
                </div>
            </Card>

            {/* Appointment List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                        <CalendarDays className="w-3 h-3" /> Appointments — {formatDate(selectedDate)}
                    </h3>
                    <span className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                        {filteredAppointments.length} Found
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                            <Calendar className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Appointments</h3>
                        <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs">No appointments found for this date. Book one to get started.</p>
                        <Button onClick={() => setShowModal(true)} className="mt-6 gap-2 font-bold text-xs">
                            <Plus className="w-4 h-4" /> Book Appointment
                        </Button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredAppointments.map((appt) => (
                            <motion.div
                                key={appt._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Card className="border-slate-300 hover:border-primary/30 hover:shadow-md transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Time Block */}
                                            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center">
                                                <Clock className="w-4 h-4 text-primary mb-1" />
                                                <span className="text-sm font-black text-primary">{appt.appointmentTime}</span>
                                            </div>

                                            {/* Patient Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h4 className="font-black text-slate-900 text-base">{appt.patientName}</h4>
                                                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{appt.upid}</span>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[appt.status]}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[appt.status]}`} />
                                                        {appt.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                                        Dr. {appt.doctorName}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                                        {appt.department}
                                                    </div>
                                                    {appt.reason && (
                                                        <span className="text-xs text-slate-400 italic truncate max-w-xs">
                                                            "{appt.reason}"
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {appt.status === "Scheduled" && (
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {updatingId === appt._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(appt._id, "Completed")}
                                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(appt._id, "No-Show")}
                                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all"
                                                            >
                                                                <AlertCircle className="w-3.5 h-3.5" /> No-Show
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(appt._id, "Cancelled")}
                                                                className="w-9 h-9 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-all"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Book Appointment Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="border-slate-800 bg-slate-900 text-white shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden">
                                <div className="h-1 w-full bg-primary" />
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                            <CalendarDays className="w-6 h-6 text-primary" /> Book Appointment
                                        </CardTitle>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
                                        >
                                            <XCircle className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-slate-500 text-sm mt-1">Schedule a new clinical appointment for a registered patient.</p>
                                </CardHeader>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="p-8 pt-4 space-y-5">
                                        {/* Patient Search */}
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Patient</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                <Input
                                                    placeholder="Search name or UPID..."
                                                    className="bg-white/5 border-white/10 h-12 pl-11 font-bold text-white placeholder:text-white/20"
                                                    value={patientSearch}
                                                    onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true); if (!e.target.value) setForm(f => ({ ...f, upid: "", patientName: "" })); }}
                                                    onFocus={() => setShowPatientDropdown(true)}
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {showPatientDropdown && patientSearch && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                                    >
                                                        {filteredPatients.slice(0, 5).map(p => (
                                                            <button
                                                                key={p._id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setForm(f => ({ ...f, upid: p.upid, patientName: p.name }));
                                                                    setPatientSearch(`${p.name} (${p.upid})`);
                                                                    setShowPatientDropdown(false);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-all"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                                                                    {p.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white">{p.name}</p>
                                                                    <p className="text-[10px] font-mono text-slate-400">{p.upid}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                        {filteredPatients.length === 0 && (
                                                            <div className="p-4 text-center text-xs text-slate-500">No patients found</div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Doctor Name: locked for Doctors, editable for Receptionist */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    Doctor Name
                                                    {isDoctor && <Lock className="w-3 h-3 text-slate-400" />}
                                                </label>
                                                {isDoctor ? (
                                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 h-12 flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4 text-primary" />
                                                        <span className="font-bold text-white text-sm">Dr. {user?.name}</span>
                                                        <Badge className="ml-auto text-[9px] bg-primary/20 text-primary border-primary/20">You</Badge>
                                                    </div>
                                                ) : (
                                                    <Input
                                                        required
                                                        placeholder="Dr. Full Name"
                                                        className="bg-white/5 border-white/10 h-12 font-bold text-white placeholder:text-white/20"
                                                        value={form.doctorName}
                                                        onChange={(e) => setForm(f => ({ ...f, doctorName: e.target.value }))}
                                                    />
                                                )}
                                            </div>
                                            <CustomSelect
                                                label="Department"
                                                options={DEPARTMENTS}
                                                value={form.department}
                                                onChange={(val) => setForm(f => ({ ...f, department: val }))}
                                                variant="dark"
                                            />
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Appointment Date</label>
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 font-bold text-white outline-none focus:ring-2 focus:ring-primary/40"
                                                    value={form.appointmentDate}
                                                    onChange={(e) => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
                                                />
                                            </div>
                                            <CustomSelect
                                                label="Time Slot"
                                                options={TIME_SLOTS}
                                                value={form.appointmentTime}
                                                onChange={(val) => setForm(f => ({ ...f, appointmentTime: val }))}
                                                variant="dark"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason (Optional)</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Brief reason for visit..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-white/20 resize-none"
                                                value={form.reason}
                                                onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setShowModal(false)}
                                                className="flex-1 h-12 font-bold text-slate-500"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={submitting || !form.upid}
                                                className="flex-1 h-12 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                                            >
                                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Booking</>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
