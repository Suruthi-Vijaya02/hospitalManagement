"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function BillingPage() {
    const [upid, setUpid] = useState("");
    const [bill, setBill] = useState(null);

    const [form, setForm] = useState({
        consultationFee: "",
        labCharges: "",
        medicineCharges: "",
    });

    const calculateTotal = () => {
        return (
            Number(form.consultationFee || 0) +
            Number(form.labCharges || 0) +
            Number(form.medicineCharges || 0)
        );
    };

    const fetchBill = async () => {
        try {
            const res = await api.get(`/billing/${upid}`);
            if (res.data.success) {
                setBill(res.data.data);
            }
        } catch {
            alert("Error fetching bill");
        }
    };

    const createBill = async () => {
        try {
            const res = await api.post("/billing", {
                upid,
                ...form,
            });

            if (res.data.success) {
                alert("Bill generated");
                setBill(res.data.data);
            }
        } catch {
            alert("Error creating bill");
        }
    };

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Billing</h1>

            {/* SEARCH */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <input
                    placeholder="Enter UPID"
                    className="border p-2 w-full"
                    value={upid}
                    onChange={(e) => setUpid(e.target.value)}
                />

                <button
                    onClick={fetchBill}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Fetch Bill
                </button>
            </div>

            {/* CREATE BILL */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <h2 className="font-medium">Create Bill</h2>

                <input
                    placeholder="Consultation Fee"
                    type="number"
                    className="border p-2 w-full"
                    value={form.consultationFee}
                    onChange={(e) =>
                        setForm({ ...form, consultationFee: e.target.value })
                    }
                />

                <input
                    placeholder="Lab Charges"
                    type="number"
                    className="border p-2 w-full"
                    value={form.labCharges}
                    onChange={(e) =>
                        setForm({ ...form, labCharges: e.target.value })
                    }
                />

                <input
                    placeholder="Medicine Charges"
                    type="number"
                    className="border p-2 w-full"
                    value={form.medicineCharges}
                    onChange={(e) =>
                        setForm({ ...form, medicineCharges: e.target.value })
                    }
                />

                {/* LIVE TOTAL */}
                <div className="text-right text-sm text-gray-600">
                    Total: ₹{calculateTotal()}
                </div>

                <button
                    onClick={createBill}
                    className="bg-green-600 text-white px-4 py-2 rounded w-full"
                >
                    Generate Bill
                </button>
            </div>

            {/* BILL DISPLAY */}
            {bill && (
                <div className="bg-white p-6 border rounded max-w-md">
                    <h2 className="text-lg font-semibold mb-4">Bill Summary</h2>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Consultation</span>
                            <span>₹{bill.consultationFee}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Lab</span>
                            <span>₹{bill.labCharges}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Medicine</span>
                            <span>₹{bill.medicineCharges}</span>
                        </div>

                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{bill.totalAmount}</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}