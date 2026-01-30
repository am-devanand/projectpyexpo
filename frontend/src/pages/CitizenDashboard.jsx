import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { createComplaint, logout } from '../api';

const CitizenDashboard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        complainant_name: '',
        location_address: '',
        location_coords: '',
        image_before: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Get location
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = `${position.coords.latitude},${position.coords.longitude}`;
                    setFormData(prev => ({ ...prev, location_coords: coords }));
                    // Mock reverse geocoding
                    setFormData(prev => ({
                        ...prev,
                        location_address: `123 Simulated St, Near Lat: ${position.coords.latitude.toFixed(4)}`
                    }));
                },
                (err) => {
                    alert("Could not get location. Please enable permissions.");
                }
            );
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image_before: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const data = new FormData();
        data.append('complainant_name', formData.complainant_name);
        data.append('location_coords', formData.location_coords);
        data.append('location_address', formData.location_address);
        if (formData.image_before) {
            data.append('image_before', formData.image_before);
        }

        try {
            const res = await createComplaint(data);
            setSuccess(res.data);
            if (res.data.is_duplicate) {
                // Handle duplicate
            }
        } catch (err) {
            console.error("Submission error:", err);
            const resData = err.response?.data;
            let errorMsg = "Failed to submit complaint";

            if (resData) {
                if (resData.error) {
                    errorMsg = resData.error;
                } else if (resData.detail) {
                    errorMsg = resData.detail;
                } else {
                    // Start of validation errors
                    // e.g. { image_before: ["Invalid image"], ... }
                    const errors = Object.values(resData).flat();
                    if (errors.length > 0) {
                        errorMsg = errors.join(', ');
                    }
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-white"
                    >
                        Citizen Dashboard
                    </motion.h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-sm"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard>
                            <h2 className="text-xl font-bold mb-6 text-cyan-300">Report an Issue</h2>

                            {success ? (
                                <div className="text-center py-10">
                                    <div className="text-5xl mb-4">✅</div>
                                    <h3 className="text-2xl font-bold mb-2">Complaint Submitted!</h3>
                                    <p className="text-white/70 mb-6">
                                        {success.is_duplicate
                                            ? "A similar complaint already exists. We've increased the urgency."
                                            : "We have received your request."}
                                    </p>
                                    <div className="bg-white/10 p-4 rounded-lg mb-6 inline-block">
                                        <span className="text-sm text-white/50 block">Reference ID</span>
                                        <span className="text-xl font-mono text-cyan-300">{success.complaint.complaint_id}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSuccess(null);
                                            setPreview(null);
                                            setFormData({ complainant_name: '', location_address: '', location_coords: '', image_before: null });
                                        }}
                                        className="block w-full py-3 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition"
                                    >
                                        Submit New Complaint
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm text-white/70 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            value={formData.complainant_name}
                                            onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
                                            className="w-full"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/70 mb-2">Location</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.location_address}
                                                readOnly
                                                placeholder="Click button to get location ->"
                                                className="w-full bg-white/5 cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={handleGetLocation}
                                                className="px-4 bg-blue-600 rounded-lg hover:bg-blue-500 transition whitespace-nowrap"
                                            >
                                                📍 Locate
                                            </button>
                                        </div>
                                        {formData.location_coords && (
                                            <p className="text-xs text-green-400 mt-2">✓ Coords locked: {formData.location_coords}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/70 mb-2">Photo Evidence</label>
                                        <div className="border border-dashed border-white/30 rounded-lg p-6 text-center hover:bg-white/5 transition relative">
                                            <input
                                                type="file"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required
                                            />
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                            ) : (
                                                <div className="text-white/50">
                                                    <p className="text-2xl mb-2">📷</p>
                                                    <p>Click to upload photo</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 rounded-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] transition ${loading ? 'opacity-50' : ''}`}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Complaint'}
                                    </button>
                                </form>
                            )}
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-blue-300 mb-2">How it Works</h3>
                            <ul className="space-y-3 text-sm text-white/70">
                                <li className="flex gap-2">
                                    <span className="text-cyan-400">1.</span> Snap a photo of the waste/garbage.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-cyan-400">2.</span> Use location button to tag GPS coords.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-cyan-400">3.</span> Submit! Inspectors will assign it.
                                </li>
                            </ul>
                        </div>

                        <GlassCard className="bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xl font-bold">
                                    !
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Smart Detection</h4>
                                    <p className="text-xs text-white/60">System automatically detects duplicate complaints within 50m and escalates priority instead of creating spam.</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
