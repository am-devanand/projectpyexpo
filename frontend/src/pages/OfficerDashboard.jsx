import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { getComplaints, getDashboardStats, logout } from '../api';

const OfficerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0, pending: 0, assigned: 0, resolved: 0, rejected: 0, escalated: 0, active: 0
    });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Live updates
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, complaintsRes] = await Promise.all([
                getDashboardStats(),
                getComplaints() // Fetch all for table
            ]);
            setStats(statsRes.data);
            setComplaints(complaintsRes.data);
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 401) navigate('/login/officer');
        }
    };

    const filteredComplaints = filter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'ASSIGNED': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'RESOLVED': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'REJECTED': return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'ESCALATED': return 'bg-orange-600/20 text-orange-400 border-orange-500/30 animate-pulse';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const StatCard = ({ title, value, color }) => (
        <GlassCard className="flex items-center justify-between p-6 bg-gradient-to-br from-white/5 to-transparent">
            <div>
                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full ${color} opacity-80`} />
        </GlassCard>
    );

    return (
        <div className="min-h-screen bg-indigo-950 p-6 relative overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white">City Analytics</h1>
                        <p className="text-indigo-200/60">Municipal Officer Overview</p>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition">
                        Logout
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard title="Active Issues" value={stats.active} color="bg-blue-500" />
                    <StatCard title="Resolved" value={stats.resolved} color="bg-green-500" />
                    <StatCard title="Escalated" value={stats.escalated} color="bg-orange-500" />
                    <StatCard title="Total Reports" value={stats.total} color="bg-purple-500" />
                </div>

                {/* Main Table Section */}
                <GlassCard className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Complaint Registry</h2>
                        <div className="flex gap-2 text-sm">
                            {['ALL', 'PENDING', 'ASSIGNED', 'ESCALATED', 'RESOLVED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 rounded-full transition ${filter === f ? 'bg-white text-indigo-900 font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-xs text-white/50 uppercase">
                                    <th className="p-4 font-normal">Complaint ID</th>
                                    <th className="p-4 font-normal">Location</th>
                                    <th className="p-4 font-normal">Status</th>
                                    <th className="p-4 font-normal">Urgency</th>
                                    <th className="p-4 font-normal">Collector</th>
                                    <th className="p-4 font-normal">Reported</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredComplaints.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-white/30">No records found</td>
                                    </tr>
                                ) : (
                                    filteredComplaints.map(row => (
                                        <tr key={row.id} className="hover:bg-white/5 transition border-t border-white/5">
                                            <td className="p-4 font-mono text-sm text-indigo-200">{row.complaint_id}</td>
                                            <td className="p-4 text-white/80 max-w-xs truncate" title={row.location_address}>{row.location_address || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {row.urgency_level > 1 && <span className="text-red-400 font-bold">Lvl {row.urgency_level}</span>}
                                            </td>
                                            <td className="p-4 text-white/60 text-sm">
                                                {row.assigned_to_username ? (
                                                    <span className="flex items-center gap-1">
                                                        🚛 {row.assigned_to_username}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 text-white/40 text-xs">
                                                {new Date(row.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default OfficerDashboard;
