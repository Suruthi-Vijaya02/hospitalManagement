import api from "@/lib/axios";

export const createPatient = (data) => api.post("/patients", data);
export const getPatients = () => api.get("/patients");
export const getPatient = (upid) => api.get(`/patients/${upid}`);