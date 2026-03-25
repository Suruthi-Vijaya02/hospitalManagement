"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function InventoryPage() {
    const [medicines, setMedicines] = useState([]);

    const [form, setForm] = useState({
        name: "",
        stock: "",
        price: "",
    });

    const fetchMedicines = async () => {
        try {
            const res = await api.get("/medicine");
            if (res.data.success) {
                setMedicines(res.data.data);
            }
        } catch {
            alert("Error fetching inventory");
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const addMedicine = async () => {
        try {
            const res = await api.post("/medicine", form);
            if (res.data.success) {
                alert("Medicine added");
                setForm({ name: "", stock: "", price: "" });
                fetchMedicines();
            }
        } catch {
            alert("Error adding medicine");
        }
    };

    const updateStock = async (id, newStock) => {
        try {
            const res = await api.put(`/medicine/${id}`, {
                stock: newStock,
            });

            if (res.data.success) {
                fetchMedicines();
            }
        } catch {
            alert("Error updating stock");
        }
    };

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Inventory</h1>

            {/* ADD MEDICINE */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <h2>Add Medicine</h2>

                <input
                    placeholder="Name"
                    className="border p-2 w-full"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <input
                    placeholder="Stock"
                    type="number"
                    className="border p-2 w-full"
                    value={form.stock}
                    onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                    }
                />

                <input
                    placeholder="Price"
                    type="number"
                    className="border p-2 w-full"
                    value={form.price}
                    onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                    }
                />

                <button
                    onClick={addMedicine}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white p-4 border rounded">
                <h2 className="mb-3 font-medium">Stock List</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Name</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Update</th>
                        </tr>
                    </thead>

                    <tbody>
                        {medicines.map((m) => (
                            <tr key={m._id} className="border-b">
                                <td className="py-2">{m.name}</td>
                                <td>{m.stock}</td>
                                <td>₹{m.price}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            updateStock(m._id, m.stock - 1)
                                        }
                                        className="text-blue-600"
                                    >
                                        -1
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStock(m._id, m.stock + 1)
                                        }
                                        className="ml-2 text-green-600"
                                    >
                                        +1
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
}