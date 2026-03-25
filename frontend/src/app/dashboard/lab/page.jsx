"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function LabPage() {
    const [upid, setUpid] = useState("");
    const [tests, setTests] = useState([]);
    const [file, setFile] = useState(null);

    const fetchLab = async () => {
        try {
            const res = await api.get(`/lab/${upid}`);
            if (res.data.success) {
                setTests(res.data.data);
            }
        } catch (err) {
            alert("Error fetching lab data");
        }
    };

    const createTest = async () => {
        try {
            const res = await api.post("/lab", {
                upid,
                testName: "Blood Test",
            });

            if (res.data.success) {
                alert("Test created");
                fetchLab();
            }
        } catch (err) {
            alert("Error creating test");
        }
    };

    const uploadReport = async (id) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(`/lab/upload?id=${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                alert("Report uploaded");
                fetchLab();
            }
        } catch (err) {
            alert("Upload failed");
        }
    };

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Lab</h1>

            {/* SEARCH */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <input
                    placeholder="Enter UPID"
                    className="border p-2 w-full"
                    value={upid}
                    onChange={(e) => setUpid(e.target.value)}
                />

                <button
                    onClick={fetchLab}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Fetch Tests
                </button>
            </div>

            {/* CREATE TEST */}
            <div className="bg-white p-4 border rounded max-w-md space-y-3">
                <button
                    onClick={createTest}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Create Lab Test
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white p-4 border rounded">
                <h2 className="mb-3 font-medium">Lab Tests</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Test</th>
                            <th>Status</th>
                            <th>Upload</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tests.map((t, i) => (
                            <tr key={i} className="border-b">
                                <td className="py-2">{t.testName}</td>
                                <td>{t.report ? "Uploaded" : "Pending"}</td>
                                <td>
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                    <button
                                        onClick={() => uploadReport(t._id)}
                                        className="ml-2 text-blue-600"
                                    >
                                        Upload
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