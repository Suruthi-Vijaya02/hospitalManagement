"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function Dashboard() {
    const [stats, setStats] = useState({
        patients: 0,
        consultations: 0,
        labs: 0,
        medicines: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const patients = await api.get("/patients");
                const consultations = await api.get("/consultations/PAT20260004");
                const labs = await api.get("/lab/PAT20260004");
                const pharmacy = await api.get("/pharmacy/PAT20260004");

                setStats({
                    patients: patients.data.data.length || 0,
                    consultations: consultations.data.data.length || 0,
                    labs: labs.data.data.length || 0,
                    medicines: pharmacy.data.data.length || 0,
                });
            } catch {
                console.log("Error loading dashboard");
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <Card title="Patients" value={stats.patients} />
                <Card title="Consultations" value={stats.consultations} />
                <Card title="Lab Tests" value={stats.labs} />
                <Card title="Medicines" value={stats.medicines} />

            </div>

        </div>
    );
}

function Card({ title, value }) {
    return (
        <div className="bg-white border p-4 rounded">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    );
}