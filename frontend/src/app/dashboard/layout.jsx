"use client";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthStore from "@/store/auth.store";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
            router.push("/login");
        }
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-gray-100">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r flex flex-col">

                <div className="p-5 border-b">
                    <h1 className="text-lg font-semibold text-blue-600">HMS</h1>
                    <p className="text-xs text-gray-500">Hospital System</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 text-sm">

                    <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Dashboard
                    </a>

                    <a href="/dashboard/patients" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Patients
                    </a>

                    <a href="/dashboard/consultations" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Consultations
                    </a>

                    <a href="/dashboard/lab" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Lab
                    </a>

                    <a href="/dashboard/pharmacy" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Pharmacy
                    </a>

                    <a href="/dashboard/billing" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Billing
                    </a>

                    <a href="/dashboard/inventory" className="block px-3 py-2 rounded hover:bg-gray-100">
                        Inventory
                    </a>

                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-sm text-red-500 hover:underline"
                    >
                        Logout
                    </button>
                </div>

            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col">

                {/* HEADER */}
                <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Dashboard
                    </h2>

                    <div className="text-sm text-gray-500">
                        Welcome
                    </div>
                </header>

                {/* CONTENT */}
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>

            </div>

        </div>
    );
}