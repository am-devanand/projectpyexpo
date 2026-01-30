import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import OfficerDashboard from './pages/OfficerDashboard';

function App() {
    const location = useLocation();

    return (
        <div className="min-h-screen mesh-gradient text-white overflow-x-hidden">
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login/:role" element={<Login />} />
                    <Route path="/citizen" element={<CitizenDashboard />} />
                    <Route path="/inspector" element={<InspectorDashboard />} />
                    <Route path="/collector" element={<CollectorDashboard />} />
                    <Route path="/officer" element={<OfficerDashboard />} />
                </Routes>
            </AnimatePresence>
        </div>
    );
}

export default App;
