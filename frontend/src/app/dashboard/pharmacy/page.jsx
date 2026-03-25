"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function PharmacyPage() {
    const [upid, setUpid] = useState("");
    const [medicines, setMedicines] = useState([]);

    const [form, setForm] = useState({
        medicineName: "",
        quantity: "",
    });

    const fetchMedicines = async () => {
        try {
            const res = await api.get(`/pharmacy/${upid}`);
            if (res.data.success) {
                setMedicines(res.data.data);
            }
        } catch {
            alert("Error fetching data");
        }
    };

    const addMedicine = async () => {
        try {
            const res = await api.post("/pharmacy", {
                upid,
                ...form,
            });

            if (res.data.success) {
                alert("Medicine added");
                setForm({ medicineName: "", quantity: "" });
                fetchMedicines();
            }
        } catch {
            alert("Error adding medicine");
        }
    };

    const issueMedicine = async (id) => {
        try {
            const res = await api.put(`/pharmacy/${id}/issue`);
            if (res.data.success) {
                alert("Medicine issued");
                fetchMedicines();
            }
        } catch {
            alert("Error issuing");
        }
    };

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Pharmacy</h1>

            {/* SEARCH */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <input
                    placeholder="Enter UPID"
                    className="border p-2 w-full"
                    value={upid}
                    onChange={(e) => setUpid(e.target.value)}
                />

                <button
                    onClick={fetchMedicines}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Fetch Medicines
                </button>
            </div>

            {/* ADD */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <h2>Add Medicine</h2>

                <input
                    placeholder="Medicine Name"
                    className="border p-2 w-full"
                    value={form.medicineName}
                    onChange={(e) =>
                        setForm({ ...form, medicineName: e.target.value })
                    }
                />

                <input
                    placeholder="Quantity"
                    className="border p-2 w-full"
                    value={form.quantity}
                    onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                    }
                />

                <button
                    onClick={addMedicine}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add Medicine
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white p-4 border rounded">
                <h2 className="mb-3 font-medium">Medicine List</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Medicine</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {medicines.map((m, i) => (
                            <tr key={i} className="border-b">
                                <td className="py-2">{m.medicineName}</td>
                                <td>{m.quantity}</td>
                                <td>
                                    {m.issued ? "Issued" : "Pending"}
                                </td>
                                <td>
                                    {!m.issued && (
                                        <button
                                            onClick={() => issueMedicine(m._id)}
                                            className="text-blue-600"
                                        >
                                            Issue
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
}