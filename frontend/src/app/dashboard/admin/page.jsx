"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import CustomSelect from "@/components/common/CustomSelect";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    Shield, 
    UserCheck, 
    Mail, 
    Calendar, 
    RefreshCcw, 
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    ChevronDown
} from "lucide-react";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/auth/users");
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            setUpdating(userId);
            const res = await api.put(`/auth/users/${userId}/role`, { role: newRole });
            if (res.data.success) {
                // Optimistic update
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update role");
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Management Terminal</span>
                    </div>
                    <h1 className="text-4xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight">User Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md">
                        Audit accounts, manage professional privileges, and oversee system access from a single command center.
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="bg-white border border-slate-300 rounded-2xl py-3 pl-11 pr-4 text-sm w-full md:w-80 text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetchUsers}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCcw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-300 dark:border-slate-800 shadow-sm overflow-visible">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Professional Identity</th>
                                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Privilege</th>
                                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Date</th>
                                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Administrative Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((user) => (
                                    <motion.tr 
                                        key={user._id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-400 shadow-inner group-hover:scale-105 transition-transform">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`
                                                inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider
                                                ${user.role === 'Admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                                  user.role === 'Doctor' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                                                  'bg-slate-500/10 text-slate-500 border border-slate-500/20'}
                                            `}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${user.role === 'Admin' ? 'bg-amber-500' : user.role === 'Doctor' ? 'bg-indigo-500' : 'bg-slate-500'}`} />
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <CustomSelect 
                                                    options={["Admin", "Doctor", "Receptionist", "Lab", "Pharmacist"]}
                                                    value={user.role}
                                                    onChange={(newRole) => handleRoleChange(user._id, newRole)}
                                                    disabled={updating === user._id}
                                                    variant="light"
                                                    className="min-w-[130px]"
                                                />
                                                {updating === user._id && (
                                                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && !loading && (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empty Directory</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">No professionals found matching your current search parameters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
