import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const Home = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'citizen',
            title: 'Citizen',
            description: 'Report waste and track status',
            color: 'from-cyan-500 to-blue-500',
        },
        {
            id: 'inspector',
            title: 'Sanitary Inspector',
            description: 'Manage and assign complaints',
            color: 'from-emerald-400 to-teal-600',
        },
        {
            id: 'collector',
            title: 'Garbage Collector',
            description: 'View and resolve tasks',
            color: 'from-orange-400 to-amber-500',
        },
        {
            id: 'officer',
            title: 'Municipal Officer',
            description: 'Monitor city-wide analytics',
            color: 'from-purple-500 to-indigo-600',
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Sticky Navbar */}
            <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold gradient-text bg-gradient-to-r from-cyan-400 to-blue-500"
                    >
                        City Care
                    </motion.div>
                    <div className="flex gap-6 text-sm font-medium text-white/80">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Home</button>
                        <button onClick={() => alert('Waste Segregation Guidelines:\n- Green Bin: Wet Waste\n- Blue Bin: Dry Waste')} className="hover:text-white transition-colors">Waste Info</button>
                        <button onClick={() => alert('City Care Support:\nHelpline: 1800-123-4567\nEmail: help@citycare.com')} className="hover:text-white transition-colors">Contact</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        <span className="block mb-2">Build a Cleaner</span>
                        <span className="gradient-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Future Together
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                        Smart waste management system for a sustainable city. Report issues, track pickups, and keep our streets clean with real-time updates.
                    </p>
                </motion.div>

                {/* Role Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                        >
                            <GlassCard
                                hoverEffect={true}
                                onClick={() => navigate(`/login/${role.id}`)}
                                className="h-full flex flex-col items-center text-center group relative overflow-hidden"
                            >
                                {/* Background Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 block">
                                    {role.icon}
                                </span>
                                <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                                    {role.title}
                                </h2>
                                <p className="text-white/60 group-hover:text-white/80 transition-colors">
                                    {role.description}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-white/40 text-sm">
                &copy; {new Date().getFullYear()} City Care Management System
            </footer>
        </div>
    );
};

export default Home;
