"use client";

import { useState } from "react";
import { loginUser } from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const setToken = useAuthStore((state) => state.setToken);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await loginUser({ email, password });

            if (res.success) {
                setToken(res.token);
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
        <div className="min-h-screen flex">

            {/* LEFT SIDE (Brand / Info) */}
            <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center p-10">
                <div className="max-w-md">
                    <h1 className="text-3xl font-bold mb-4">
                        Hospital Management System
                    </h1>
                    <p className="text-sm opacity-90">
                        Streamline patient care, manage records efficiently, and ensure smooth hospital operations.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE (Login Form) */}
            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
                <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border">

                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
                        Sign in
                    </h2>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm text-gray-600 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    {/* Footer */}
                    <p className="text-xs text-gray-400 text-center mt-6">
                        Secure access for authorized hospital staff only
                    </p>

                </div>
            </div>
        </div>
    );
}