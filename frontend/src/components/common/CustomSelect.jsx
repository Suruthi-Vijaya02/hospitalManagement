"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select option", 
    label,
    className = "",
    disabled = false,
    variant = "dark" // "dark" or "light"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom
            });
        }
    };

    const handleToggle = () => {
        if (!disabled) {
            updateCoords();
            setIsOpen(!isOpen);
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
    const displayValue = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
    const isDark = variant === "dark";
    
    // Calculate if we should open upwards
    const spaceBelow = mounted ? window.innerHeight - coords.bottom : 0;
    const openUpwards = spaceBelow < 300;

    const menuContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: openUpwards ? 10 : -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: openUpwards ? 10 : -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        position: 'fixed',
                        left: coords.left,
                        width: coords.width,
                        zIndex: 9999,
                        ...(openUpwards 
                            ? { bottom: window.innerHeight - coords.top + 8 } 
                            : { top: coords.bottom + 8 })
                    }}
                    className={`
                        rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden py-2 border
                        ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                    `}
                >
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {options.map((option) => {
                            const optValue = typeof option === 'object' ? option.value : option;
                            const optLabel = typeof option === 'object' ? option.label : option;
                            const isSelected = optValue === value;

                            return (
                                <button
                                    key={optValue}
                                    type="button"
                                    onClick={() => {
                                        onChange(optValue);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-all
                                        ${isSelected 
                                            ? 'bg-primary text-white' 
                                            : isDark 
                                                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}
                                    `}
                                >
                                    {optLabel}
                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
            {label && (
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`
                        w-full flex items-center justify-between gap-3 px-4 transition-all outline-none
                        text-sm font-bold rounded-xl
                        ${isDark 
                            ? 'bg-white/5 border border-white/10 text-white h-14 h-14' 
                            : 'bg-slate-50 border border-slate-300 text-slate-900 h-10'}
                        ${isOpen ? 'ring-2 ring-primary/40 border-primary/40' : 'hover:border-primary/20'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${!displayValue && isDark ? 'text-white/20' : !displayValue ? 'text-slate-300' : ''}
                    `}
                >
                    <span className="truncate">{displayValue || placeholder}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'} ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {mounted && createPortal(menuContent, document.body)}
            </div>
        </div>
    );
}

