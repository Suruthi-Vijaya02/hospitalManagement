"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function ConsultationPage() {
    const [upid, setUpid] = useState("");
    const [consultations, setConsultations] = useState([]);

    const [form, setForm] = useState({
        doctor: "",
        diagnosis: "",
        prescription: "",
    });

    const fetchConsultations = async () => {
        try {
            const res = await api.get(`/consultations/${upid}`);
            if (res.data.success) {
                setConsultations(res.data.data);
            }
        } catch (err) {
            alert("Error fetching consultations");
        }
    };

    const handleSubmit = async () => {
        try {
            const res = await api.post("/consultations", {
                upid,
                ...form,
            });

            if (res.data.success) {
                alert("Consultation added");
                setForm({ doctor: "", diagnosis: "", prescription: "" });
                fetchConsultations();
            }
        } catch (err) {
            alert("Error adding consultation");
        }
    };

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Consultations</h1>

            {/* SEARCH BY UPID */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <input
                    placeholder="Enter Patient UPID"
                    className="border p-2 w-full"
                    value={upid}
                    onChange={(e) => setUpid(e.target.value)}
                />

                <button
                    onClick={fetchConsultations}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Fetch History
                </button>
            </div>

            {/* ADD CONSULTATION */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <h2 className="font-medium">Add Consultation</h2>

                <input
                    placeholder="Doctor Name"
                    className="border p-2 w-full"
                    value={form.doctor}
                    onChange={(e) =>
                        setForm({ ...form, doctor: e.target.value })
                    }
                />

                <input
                    placeholder="Diagnosis"
                    className="border p-2 w-full"
                    value={form.diagnosis}
                    onChange={(e) =>
                        setForm({ ...form, diagnosis: e.target.value })
                    }
                />

                <input
                    placeholder="Prescription"
                    className="border p-2 w-full"
                    value={form.prescription}
                    onChange={(e) =>
                        setForm({ ...form, prescription: e.target.value })
                    }
                />

                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add Consultation
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white p-4 border rounded">
                <h2 className="mb-3 font-medium">Consultation History</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Doctor</th>
                            <th>Diagnosis</th>
                            <th>Prescription</th>
                        </tr>
                    </thead>

                    <tbody>
                        {consultations.map((c, i) => (
                            <tr key={i} className="border-b">
                                <td className="py-2">{c.doctor}</td>
                                <td>{c.diagnosis}</td>
                                <td>{c.prescription}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}