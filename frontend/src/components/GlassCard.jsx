import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, onClick }) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { scale: 1.02, textShadow: "0px 0px 8px rgb(255,255,255)" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`glass-card p-6 ${hoverEffect ? 'cursor-pointer hover:bg-white/20 hover:border-white/40' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
