"use client";

import { useEffect, useState } from "react";
import { loginUser } from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight, Activity, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    const { user, setAuth, loadAuth } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        loadAuth();
        setIsHydrated(true);
    }, [loadAuth]);

    useEffect(() => {
        if (isHydrated && user) {
            router.push("/dashboard");
        }
    }, [user, isHydrated, router]);

    if (!isHydrated || user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await loginUser({ email, password });

            if (res.success) {
                setAuth({ user: res.user, token: res.token });
                router.push("/dashboard");
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background font-inter">
            {/* Left Side: Visual Brilliance (Matching Register) */}
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
                            Welcome Back to <br/>
                            <span className="text-primary-foreground/80">Excellence.</span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-lg font-light leading-relaxed">
                            Log in to access your specialized medical dashboard and continue providing world-class care.
                        </p>
                    </motion.div>

                    <div className="flex gap-8 text-white/50 text-sm font-medium border-t border-white/10 pt-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Secure Session
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Pulse Monitor Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Elegant Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-outfit font-bold text-foreground tracking-tight mb-2">Sign In</h2>
                        <p className="text-muted-foreground">Authorized access for hospital personnel.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm dark:text-white"
                                    placeholder="yourname@hospital.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-foreground/80">Access Key</label>
                                <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm dark:text-white"
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full group bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        Sign In <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                    <div className="mt-12 text-center lg:text-left">
                        <p className="text-muted-foreground text-sm">
                            New member?{" "}
                            <a href="/register" className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all">
                                Join HMS Impeccable
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}