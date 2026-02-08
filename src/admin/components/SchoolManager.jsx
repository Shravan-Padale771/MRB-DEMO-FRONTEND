import React, { useState, useEffect } from 'react';
import { Building2, Plus, RefreshCw, School } from 'lucide-react';
import toast from 'react-hot-toast';
import { addSchool, getAllSchools, getAllExamCentres } from '../../api';

const SchoolManager = () => {
    const [schools, setSchools] = useState([]);
    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolName: "",
        centreId: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getAllSchools(),
                getAllExamCentres()
            ]);

            if (results[0].status === 'fulfilled') {
                const data = results[0].value;
                console.log("DEBUG: Final Schools JSON ->", data);
                setSchools(Array.isArray(data) ? data : []);
            } else {
                setSchools([]);
            }

            if (results[1].status === 'fulfilled') {
                const data = results[1].value;
                setCentres(Array.isArray(data) ? data : []);
            } else {
                setCentres([]);
            }
        } catch (error) {
            console.error("Unexpected error fetching data:", error);
            toast.error("Failed to load data");
        }
        setLoading(false);
    };

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        if (!formData.schoolName || !formData.centreId) {
            return toast.error("Please fill all fields");
        }

        try {
            await addSchool(formData.centreId, { schoolName: formData.schoolName });
            toast.success("School Added!");
            setFormData({ schoolName: "", centreId: "" });
            fetchData();
        } catch (error) {
            console.error("Error adding school:", error);
            toast.error("Failed to add school");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Building2 size={24} /> School Management
                </h2>

                <form onSubmit={handleCreateSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">School Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. KV School"
                            value={formData.schoolName}
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Select Exam Centre</label>
                        <select
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={formData.centreId}
                            onChange={(e) => setFormData({ ...formData, centreId: e.target.value })}
                        >
                            <option value="">Select Exam Centre</option>
                            {Array.isArray(centres) && centres.map((c, idx) => (
                                <option key={c.centreId || `c-${idx}`} value={c.centreId}>
                                    {c.centreName} ({c.centreCode})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Add School
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Existing Schools</h3>
                    <button
                        onClick={fetchData}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-sm font-bold text-gray-600">School</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Exam Centre</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Region</th>
                                <th className="p-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(schools) && schools.length === 0) ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 italic font-medium">
                                        No schools found. Add your first school!
                                    </td>
                                </tr>
                            ) : (
                                Array.isArray(schools) && schools.map((school, idx) => (
                                    <tr key={school.schoolId || `school-${idx}`} className="border-b transition-colors hover:bg-gray-50/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                    {school.schoolName?.charAt(0) || "S"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{school.schoolName}</span>
                                                    <span className="text-[10px] text-gray-400">ID: #{school.schoolId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    {school.examCentre?.centreName || "N/A"}
                                                </span>
                                                <p className="text-[10px] text-gray-400 font-mono">
                                                    {school.examCentre?.centreCode || ""}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                {typeof school.examCentre?.region === 'string'
                                                    ? school.examCentre.region
                                                    : (school.examCentre?.region?.regionName || "City Area")}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <button className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchoolManager;
