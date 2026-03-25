"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [form, setForm] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
    });

    const fetchPatients = async () => {
        try {
            const res = await api.get("/patients");
            if (res.data.success) {
                setPatients(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching patients");
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleSubmit = async () => {
        try {
            const res = await api.post("/patients", form);
            if (res.data.success) {
                alert("Patient created");
                setForm({ name: "", age: "", gender: "", phone: "" });
                fetchPatients();
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Error creating patient");
        }
    };

    return (
        <div className="space-y-6">

            {/* TITLE */}
            <h1 className="text-xl font-semibold">Patients</h1>

            {/* FORM */}
            <div className="bg-white p-4 rounded border space-y-3 max-w-md">
                <input
                    placeholder="Name"
                    className="border p-2 w-full"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                    placeholder="Age"
                    className="border p-2 w-full"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                />

                <input
                    placeholder="Gender"
                    className="border p-2 w-full"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                />

                <input
                    placeholder="Phone"
                    className="border p-2 w-full"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Add Patient
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white p-4 rounded border">
                <h2 className="mb-3 font-medium">Patient List</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="py-2">Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>UPID</th>
                        </tr>
                    </thead>

                    <tbody>
                        {patients.map((p, i) => (
                            <tr key={i} className="border-b">
                                <td className="py-2">{p.name}</td>
                                <td>{p.age}</td>
                                <td>{p.gender}</td>
                                <td>{p.phone}</td>
                                <td>{p.upid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
}