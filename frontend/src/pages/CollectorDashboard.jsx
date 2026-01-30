import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { getComplaints, resolveComplaint, rejectComplaint, logout, simulateTimeout } from '../api';

const CollectorDashboard = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState(null); // ID of task being worked on
    const [actionType, setActionType] = useState(null); // 'resolve' or 'reject'
    const [formData, setFormData] = useState({ image_after: null, reason: '' });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Get current user ID from local storage to filter? 
            // Actually backend filters by 'me' implicitly or we pass ID. 
            // Implementation Plan mentions endpoint /complaints/?assigned_to=ID
            // But let's assume `getComplaints` could be updated to support 'my tasks' or we use `getComplaints({ assigned_to: myId })`
            // For now, let's look at `getComplaints` implementation in previous step.
            // Ideally we need the user ID. 
            const userStr = localStorage.getItem('user');
            if (!userStr) { navigate('/login/collector'); return; }
            const user = JSON.parse(userStr);

            const res = await getComplaints({ assigned_to: user.id, status: 'ASSIGNED' });
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate('/login/collector');
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!formData.image_after) return alert("Please upload proof image");

        const data = new FormData();
        data.append('image_after', formData.image_after);

        try {
            await resolveComplaint(activeTask, data);
            resetAction();
            fetchTasks();
        } catch (err) {
            alert("Failed to resolve task");
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        if (!formData.reason) return alert("Please provide a reason");

        try {
            await rejectComplaint(activeTask, formData.reason);
            resetAction();
            fetchTasks();
        } catch (err) {
            alert("Failed to reject task");
        }
    };

    const resetAction = () => {
        setActiveTask(null);
        setActionType(null);
        setFormData({ image_after: null, reason: '' });
    };

    const handleSimulateDelay = async () => {
        // Force escalate all my tasks or simulate a global timeout
        try {
            await simulateTimeout(tasks.map(t => t.id));
            alert("Simulation triggered! 16hr delay simulated. Check Officer Dashboard.");
            fetchTasks(); // They should disappear from here if status changes to ESCALATED? 
            // Actually Officer dashboard sees ESCALATED, but maybe collector still sees them or they get reassigned?
            // Requirement says: "Clicking this forces the current pending tasks to escalate."
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-amber-900 p-6 relative overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />

            <div className="max-w-5xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
                        <p className="text-orange-200/60">Garbage Collector Dashboard</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSimulateDelay}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 text-red-100 rounded-lg text-sm transition"
                        >
                            ⚠️ Simulate Delay
                        </button>
                        <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition">
                            Logout
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="text-white text-center py-20">Loading tasks...</div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {tasks.length === 0 && (
                                <div className="text-center py-20 text-white/50 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-4xl mb-4">✨</p>
                                    <p>Clean sheet! No tasks assigned.</p>
                                </div>
                            )}

                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <GlassCard className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        {/* Left: Image & Info */}
                                        <div className="flex-1 flex gap-4">
                                            <img
                                                src={task.image_before}
                                                alt="Task"
                                                className="w-24 h-24 rounded-lg object-cover bg-black/20"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-orange-300 text-sm">{task.complaint_id}</span>
                                                    <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {task.urgency_level > 1 ? 'High Priority' : 'Normal'}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">{task.location_address || "No Address"}</h3>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${task.location_coords}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-400 text-sm hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    📍 Open in Maps
                                                </a>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="w-full md:w-auto flex flex-col items-end gap-2 min-w-[300px]">
                                            {activeTask === task.id ? (
                                                <div className="w-full bg-black/20 p-4 rounded-lg border border-white/10">
                                                    <div className="flex justify-between mb-4">
                                                        <span className="font-bold text-sm text-white">{actionType === 'resolve' ? 'Upload Proof' : 'Reject Task'}</span>
                                                        <button onClick={resetAction} className="text-xs text-white/50 hover:text-white">Cancel</button>
                                                    </div>

                                                    {actionType === 'resolve' ? (
                                                        <form onSubmit={handleResolve} className="space-y-3">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => setFormData({ ...formData, image_after: e.target.files[0] })}
                                                                className="text-sm"
                                                                required
                                                            />
                                                            <button type="submit" className="w-full py-2 bg-green-600 rounded text-sm font-bold text-white hover:bg-green-500">
                                                                Mark as Cleaned
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <form onSubmit={handleReject} className="space-y-3">
                                                            <textarea
                                                                placeholder="Reason for rejection..."
                                                                value={formData.reason}
                                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                                className="w-full h-20 text-sm bg-black/30"
                                                                required
                                                            ></textarea>
                                                            <button type="submit" className="w-full py-2 bg-red-600 rounded text-sm font-bold text-white hover:bg-red-500">
                                                                Confirm Rejection
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <button
                                                        onClick={() => { setActiveTask(task.id); setActionType('reject'); }}
                                                        className="flex-1 px-4 py-2 border border-red-400/50 text-red-200 rounded-lg hover:bg-red-500/20 transition whitespace-nowrap"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                    <button
                                                        onClick={() => { setActiveTask(task.id); setActionType('resolve'); }}
                                                        className="flex-1 px-6 py-2 bg-green-600 rounded-lg text-white font-bold hover:bg-green-500 shadow-lg shadow-green-900/20 whitespace-nowrap"
                                                    >
                                                        ✓ Cleaned
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectorDashboard;
