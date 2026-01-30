import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { login } from '../api';

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roleConfig = {
        citizen: { title: 'Citizen Login', bg: 'bg-citizen', redirect: '/citizen' },
        inspector: { title: 'Inspector Login', bg: 'bg-inspector', redirect: '/inspector' },
        collector: { title: 'Collector Login', bg: 'bg-collector', redirect: '/collector' },
        officer: { title: 'Officer Login', bg: 'bg-officer', redirect: '/officer' },
    };

    const config = roleConfig[role] || roleConfig.citizen;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const roleUpper = role.toUpperCase() === 'OFFICER' ? 'OFFICER'
                : role.toUpperCase() === 'INSPECTOR' ? 'INSPECTOR'
                    : role.toUpperCase() === 'COLLECTOR' ? 'COLLECTOR'
                        : 'CITIZEN';

            const response = await login(formData.username, formData.password, roleUpper);

            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate(config.redirect);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden`}>
            {/* Background with Role Theme */}
            <div className={`absolute inset-0 ${config.bg} opacity-20`} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="border-t-4 border-t-white/50">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
                        <p className="text-white/60">Enter your credentials to access the dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full"
                                placeholder={role === 'citizen' ? "Enter 'guest' for demo" : "Enter username"}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full"
                                placeholder={role === 'citizen' ? "Enter 'guest' for demo" : "Enter password"}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg 
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'} 
                ${role === 'citizen' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' :
                                    role === 'inspector' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                                        role === 'collector' ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
                                            'bg-gradient-to-r from-purple-500 to-indigo-600'} 
                transition-all duration-300`}
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>

                    {role === 'citizen' && (
                        <div className="mt-6 text-center text-sm text-white/50">
                            <p>Demo Citizen: username: <strong>guest</strong> / password: <strong>guest</strong></p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-white/50 hover:text-white transition-colors text-sm"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Login;
