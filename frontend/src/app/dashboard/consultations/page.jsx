"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, AlertCircle, Loader2, Sparkles, User, Activity, Clock, FilePlus, Search, Beaker
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatient, getPatients } from "@/services/patient.service";
import api from "@/lib/axios";

function SectionHeader({ icon: Icon, title, description }) {
    return (
        <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            </div>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </CardHeader>
    );
}

function VitalsItem({ label, value, subValue }) {
    return (
        <Card className="shadow-none bg-slate-50/50 dark:bg-slate-900/50">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-xl font-semibold text-foreground">
                    {value} {subValue && <span className="text-sm font-normal text-muted-foreground">{subValue}</span>}
                </p>
            </CardContent>
        </Card>
    );
}

export default function ConsultationsPage() {
    const router = useRouter();
    
    // Patient Search State
    const [upid, setUpid] = useState("");
    const [patientData, setPatientData] = useState(null);
    const [patientLoading, setPatientLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPatientList, setShowPatientList] = useState(false);

    // Fetch all patients state
    const [patients, setPatients] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);

    // Consultation Form State
    const [symptoms, setSymptoms] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [icdCode, setIcdCode] = useState("");
    const [prescription, setPrescription] = useState("");
    const [notes, setNotes] = useState("");
    const [nextFollowUpDate, setNextFollowUpDate] = useState("");
    
    const [loading, setLoading] = useState(false);

    // Fetch all patients on mount
    useEffect(() => {
        const fetchPatients = async () => {
            setPatientsLoading(true);
            try {
                const res = await getPatients();
                setPatients(res.data?.data || res.data || []);
            } catch (error) {
                console.error("Error fetching patients list:", error);
            } finally {
                setPatientsLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p => 
        p.upid.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Load selected patient data when upid changes
    useEffect(() => {
        const loadPatient = async () => {
            if (!upid) {
                setPatientData(null);
                setSymptoms("");
                setDiagnosis("");
                setPrescription("");
                setNotes("");
                return;
            }
            
            setPatientLoading(true);
            try {
                const res = await getPatient(upid);
                if (res.data?.data) {
                    setPatientData(res.data.data);
                    setSymptoms(res.data.data.symptoms || "");
                    setDiagnosis("");
                    setIcdCode("");
                    setPrescription("");
                    setNotes("");
                    setNextFollowUpDate("");
                } else {
                    setPatientData(null);
                }
            } catch (error) {
                console.error("Error fetching patient details:", error);
                setPatientData(null);
            } finally {
                setPatientLoading(false);
            }
        };

        loadPatient();
    }, [upid]);

    const submitConsultation = async () => {
        if (!patientData) {
            alert("Please select a patient first.");
            return;
        }
        
        if (!diagnosis.trim()) {
            alert("Please provide a primary diagnosis.");
            return;
        }
        
        setLoading(true);
        try {
            await api.post("/consultations", {
                upid: patientData.upid,
                diagnosis,
                icdCode,
                prescription,
                notes,
                nextFollowUpDate
            });
            alert("Consultation saved successfully!");
            
            // Clear form
            setSymptoms("");
            setDiagnosis("");
            setIcdCode("");
            setPrescription("");
            setNotes("");
            setNextFollowUpDate("");
        } catch (error) {
            console.error(error);
            alert("Error saving consultation: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAddLabTest = () => {
        if (!patientData) {
            alert("Please select a patient first.");
            return;
        }
        router.push(`/dashboard/lab?upid=${patientData.upid}`);
    };

    const handleAddMedicines = () => {
        if (!patientData) {
            alert("Please select a patient first.");
            return;
        }
        router.push(`/dashboard/pharmacy?upid=${patientData.upid}`);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Consultation Desk</h1>
                    <p className="text-sm text-muted-foreground mt-1">Record patient visits, diagnosis, and issue prescriptions.</p>
                </div>
                <div className="flex items-center gap-4 relative z-[100]">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            placeholder="Search Name or UPID..."
                            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-2xl z-[101] max-h-60 overflow-y-auto p-2 space-y-1"
                                >
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map(p => (
                                            <div 
                                                key={p.upid}
                                                onClick={() => {
                                                    setUpid(p.upid);
                                                    setSearchTerm(`${p.name} (${p.upid})`);
                                                    setShowPatientList(false);
                                                }}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg border border-transparent hover:border-primary/20 transition-all flex flex-col"
                                            >
                                                <span className="text-sm font-bold">{p.name}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.upid}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-[10px] font-bold text-muted-foreground uppercase">No results</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {patientLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Patient Info & Vitals */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Patient Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl font-semibold text-foreground">
                                        {patientData ? patientData.name : "No Patient"}
                                    </CardTitle>
                                    <CardDescription className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="w-4 h-4" /> 
                                        {patientData ? patientData.upid : "---"}
                                    </CardDescription>
                                </div>
                                {patientData && (
                                    <Badge variant="default">
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Age / Gender</p>
                                    <p className="font-medium text-foreground">
                                        {patientData ? `${patientData.age || '--'}y, ${patientData.gender || '--'}` : "---"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Last Visit</p>
                                    <p className="font-medium flex items-center gap-1 text-foreground">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        {patientData?.createdAt ? new Date(patientData.createdAt).toLocaleDateString() : "---"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vitals Card */}
                    <Card>
                        <SectionHeader icon={Activity} title="Recent Vitals" />
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <VitalsItem label="Blood Pressure" value="N/A" />
                                <VitalsItem label="Heart Rate" value="N/A" subValue="bpm" />
                                <VitalsItem label="Temperature" value="N/A" />
                                <VitalsItem label="Oxygen Level" value="N/A" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Consultation Form & Actions */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="flex-1">
                        <SectionHeader 
                            icon={Stethoscope} 
                            title="Clinical Assessment" 
                            description="Document symptoms, provide diagnosis, and prescribe treatment." 
                        />
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="symptoms" className="text-sm text-muted-foreground">Presenting Symptoms</Label>
                                <Textarea 
                                    id="symptoms"
                                    placeholder="Patient reports headache, fatigue, and mild fever since 3 days..." 
                                    className="min-h-[100px] resize-none"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label htmlFor="diagnosis" className="text-sm text-muted-foreground">Primary Diagnosis</Label>
                                    <Input 
                                        id="diagnosis"
                                        placeholder="e.g. Viral Pharyngitis" 
                                        className="font-medium"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="icdCode" className="text-sm text-muted-foreground">ICD-10 Code</Label>
                                    <Input 
                                        id="icdCode"
                                        placeholder="e.g. J02.9" 
                                        className="font-medium font-mono uppercase"
                                        value={icdCode}
                                        onChange={(e) => setIcdCode(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="prescription" className="text-sm text-muted-foreground">Prescription Form/Instructions</Label>
                                <Textarea 
                                    id="prescription"
                                    placeholder="1. Paracetamol 500mg - SOS&#10;2. Amoxicillin 250mg - 1-0-1 x 5 days" 
                                    className="min-h-[120px] resize-none font-mono text-sm"
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="nextFollowUpDate" className="text-sm text-muted-foreground">Next Follow-up Date (Optional)</Label>
                                <Input 
                                    id="nextFollowUpDate"
                                    type="date"
                                    className="font-medium w-full sm:w-1/2"
                                    value={nextFollowUpDate}
                                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="notes" className="text-sm text-muted-foreground">Physician Notes (Optional)</Label>
                                <Textarea 
                                    id="notes"
                                    placeholder="Additional observations or follow-up instructions..." 
                                    className="min-h-[80px] resize-none bg-slate-50/50 dark:bg-slate-900/50"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/20 p-4 border-t flex justify-end">
                            <Button 
                                onClick={submitConsultation} 
                                disabled={loading || !patientData}
                                className="w-full sm:w-auto"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><FilePlus className="mr-2 h-4 w-4" /> Save Consultation</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Clinical Navigation Panel */}
                    <Card className="border-l-4 border-l-primary">
                        <SectionHeader 
                            icon={Sparkles} 
                            title="Clinical Actions" 
                            description="Route patient for further clinical procedures." 
                        />
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    className="flex-1" 
                                    variant="outline" 
                                    onClick={handleAddLabTest}
                                    disabled={!patientData}
                                >
                                    <Beaker className="w-4 h-4 mr-2 text-primary" /> Add Lab Test
                                </Button>
                                <Button 
                                    className="flex-1" 
                                    variant="outline" 
                                    onClick={handleAddMedicines}
                                    disabled={!patientData}
                                >
                                    <FilePlus className="w-4 h-4 mr-2 text-primary" /> Add Medicines
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}