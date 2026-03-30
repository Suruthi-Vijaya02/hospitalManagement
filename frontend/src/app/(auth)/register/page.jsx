"use client";

import { useState } from "react";
import { registerUser } from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, ShieldCheck, ArrowRight, Activity } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Doctor");
    const [loading, setLoading] = useState(false);

    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password || !role) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await registerUser({ name, email, password, role });

            if (res.success) {
                if (res.token) {
                    setAuth({ user: res.user, token: res.token });
                    router.push("/dashboard");
                } else {
                    router.push("/login");
                }
            } else {
                alert(res.message || "Registration failed");
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background font-inter">
            {/* Left Side: Visual Brilliance */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
                <img 
                    src="/hospital_tech_background_1774852321995.png" 
                    alt="Healthcare Technology" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-primary/10"></div>
                
                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-2xl font-outfit font-bold text-white tracking-tight">HMS Impeccable</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-6xl font-outfit font-bold text-white leading-tight mb-6">
                            Precision in <br/>
                            <span className="text-primary-foreground/80">Care Management.</span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-lg font-light leading-relaxed">
                            Empowering healthcare professionals with a seamless, high-performance ecosystem for patient-first excellence.
                        </p>
                    </motion.div>

                    <div className="flex gap-8 text-white/50 text-sm font-medium border-t border-white/10 pt-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> HIPAA Compliant
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Real-time Analytics
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Elegant Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10">
                        <h2 className="text-4xl font-outfit font-bold text-foreground tracking-tight mb-2">Create Account</h2>
                        <p className="text-muted-foreground">Begin your journey with state-of-the-art management.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="Dr. Julian Vane"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="j.vane@hospital.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">Identity</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="Doctor">Doctor</option>
                                        <option value="Receptionist">Receptionist</option>
                                        <option value="Pharmacist">Pharmacist</option>
                                        <option value="Lab">Lab Specialist</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full group bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground text-sm">
                            Already part of the network?{" "}
                            <a href="/login" className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all">
                                Sign In
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
