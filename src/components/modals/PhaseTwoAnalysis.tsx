
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainIcon, CheckIcon, LayersIcon, BookIcon, HeadphonesIcon, SearchIcon } from '../common/Icons';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';

interface PhaseTwoProps {
    onComplete: () => void;
}

// STAGE 1 DATA: 7 Exam Parts with more detail
const PARTS_DATA = [
    { id: 'Part 1', name: 'Photographs', score: 85, status: 'Strong' },
    { id: 'Part 2', name: 'Q&A', score: 65, status: 'Average' },
    { id: 'Part 3', name: 'Conversations', score: 40, status: 'Weak' },
    { id: 'Part 4', name: 'Talks', score: 70, status: 'Good' },
    { id: 'Part 5', name: 'Incomplete Sentences', score: 90, status: 'Strong' },
    { id: 'Part 6', name: 'Text Completion', score: 55, status: 'Average' },
    { id: 'Part 7', name: 'Reading Comp', score: 45, status: 'Weak' },
];

// STAGE 2 DATA: System Modules (Left Column)
const SYSTEM_MODULES = [
    { id: 'vocab', label: 'Vocabulary', icon: BookIcon, color: 'bg-blue-100 text-blue-600 border-blue-200', particleColor: 'bg-blue-500' },
    { id: 'grammar', label: 'Grammar', icon: LayersIcon, color: 'bg-purple-100 text-purple-600 border-purple-200', particleColor: 'bg-purple-500' },
    { id: 'listen', label: 'Listening', icon: HeadphonesIcon, color: 'bg-emerald-100 text-emerald-600 border-emerald-200', particleColor: 'bg-emerald-500' },
];

// STAGE 3 DATA: Weekly Schedule (Right Column)
const SCHEDULE_DATA = [
    { day: 'Day 1', title: 'Vocab Booster', type: 'Vocab', color: 'border-blue-500 text-blue-700 bg-blue-50' },
    { day: 'Day 2', title: 'Listening Drills', type: 'Audio', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
    { day: 'Day 3', title: 'Reading Tech', type: 'Reading', color: 'border-purple-500 text-purple-700 bg-purple-50' },
    { day: 'Day 4', title: 'Grammar Fix', type: 'Mixed', color: 'border-orange-500 text-orange-700 bg-orange-50' },
    { day: 'Day 5', title: 'Full Review', type: 'Review', color: 'border-rose-500 text-rose-700 bg-rose-50' },
];

type Scene = 'scan' | 'retrieve' | 'distribute' | 'completed';

const PhaseTwoAnalysis: React.FC<PhaseTwoProps> = ({ onComplete }) => {
    const [scene, setScene] = useState<Scene>('scan');

    const [scannedPartIndex, setScannedPartIndex] = useState(-1);
    const [retrieving, setRetrieving] = useState(false);
    const [distributedCount, setDistributedCount] = useState(-1);

    // Responsive Checks
    const isMobile = useMediaQuery('(max-width:768px)');
    const isLargeScreen = useMediaQuery('(min-width:1280px)'); // XL Breakpoint


    const navigate = useNavigate();
    const handleClickSeenNewWeek = () => {
        navigate('/programs');
    }
    // --- ORCHESTRATION ---
    useEffect(() => {
        // 1. SCANNING SEQUENCE
        if (scene === 'scan') {
            const interval = setInterval(() => {
                setScannedPartIndex(prev => {
                    if (prev >= PARTS_DATA.length - 1) {
                        clearInterval(interval);
                        setTimeout(() => setScene('retrieve'), 20000);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 400); // Scan speed
            return () => clearInterval(interval);
        }

        // 2. RETRIEVAL SEQUENCE
        if (scene === 'retrieve') {
            const startTimer = setTimeout(() => setRetrieving(true), 600); // Wait for brain to move
            const endTimer = setTimeout(() => {
                setRetrieving(false);
                setTimeout(() => setScene('distribute'), 500);
            }, 4000);
            return () => { clearTimeout(startTimer); clearTimeout(endTimer); };
        }

        // 3. DISTRIBUTION SEQUENCE
        if (scene === 'distribute') {
            const interval = setInterval(() => {
                setDistributedCount(prev => {
                    if (prev >= SCHEDULE_DATA.length - 1) {
                        clearInterval(interval);
                        setTimeout(() => {
                            setScene('completed');
                            onComplete();
                        }, 800);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 2000); // 2 seconds per day (Slowed down as requested)
            return () => clearInterval(interval);
        }
    }, [scene, onComplete]);

    // Helper for Status Badge Color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Strong': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Good': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Average': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Weak': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Layout Condition: Is Brain Centered?
    // Brain is centered in Retrieve, Distribute, Completed.
    // Brain is on Left in Scan.
    const isBrainCentered = scene !== 'scan';

    return (
        <div className="w-full h-full bg-slate-50 overflow-y-auto overflow-x-hidden relative flex flex-col font-sans no-scrollbar">

            {/* HEADER STATUS */}
            <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur py-3 px-4 text-center border-b border-slate-200 shadow-sm">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={scene}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-center gap-2"
                    >
                        <div className={`w-2 h-2 rounded-full ${scene === 'completed' ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`} />
                        <p className="text-xs xl:text-sm font-bold text-slate-600 uppercase tracking-widest">
                            {scene === 'scan' && "Analyzing Weaknesses..."}
                            {scene === 'retrieve' && "Extracting Learning Modules..."}
                            {scene === 'distribute' && "Synthesizing Curriculum..."}
                            {scene === 'completed' && "Optimization Complete"}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* --- MAIN GRID LAYOUT --- */}
            {/* 
          Mobile: Flex Column (Stacked)
          Desktop: Grid Layout
      */}
            <div className={`flex-1 items-center p-12 xl:p-12 relative min-h-[500px] xl:min-h-[600px] transition-all duration-700
          ${isBrainCentered
                    ? 'flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-4 xl:gap-8'
                    : 'flex flex-col md:flex-row items-center justify-between gap-20 md:gap-32 xl:gap-20'
                }
      `}>

                {/* =========================================
             LEFT COLUMN (SYSTEMS)
             Mobile: Top / Order 1
             Desktop: Left / Col Span 3
             ========================================= */}
                {isBrainCentered && (
                    <div className="order-1 md:col-span-3 flex md:flex-col flex-row justify-center items-center gap-4 md:gap-10 xl:gap-16 relative z-10 md:border-r md:border-slate-200/50 pr-0 md:pr-2">
                        <AnimatePresence>
                            {(scene === 'retrieve' || scene === 'distribute' || scene === 'completed') && (
                                SYSTEM_MODULES.map((mod, idx) => {
                                    // ANIMATION TRAJECTORIES
                                    // Adjust distances for larger screens (XL)

                                    // Desktop Y-Offsets to curve to brain center
                                    // Scale offset for XL screens
                                    const scaleY = isLargeScreen ? 1.5 : 1;
                                    const desktopYOffset = (idx === 0 ? 120 : idx === 2 ? -120 : 0) * scaleY;

                                    // Desktop X-Offset (Distance to brain center)
                                    const desktopXDistance = isLargeScreen ? 400 : 240;

                                    return (
                                        <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, y: isMobile ? -20 : 0, x: isMobile ? 0 : -30 }}
                                            animate={{ opacity: 1, y: 0, x: 0 }}
                                            transition={{ delay: idx * 0.15 }}
                                            className={`w-[80px] md:w-full max-w-[90px] xl:max-w-[130px] aspect-square rounded-2xl border bg-white shadow-sm flex flex-col items-center justify-center gap-2 p-2 relative z-20 ${mod.color}`}
                                        >
                                            <div className="p-1.5 xl:p-2.5 bg-white/60 rounded-full backdrop-blur-sm">
                                                <mod.icon className="w-5 md:w-6 xl:w-8 h-5 md:h-6 xl:h-8 opacity-90" />
                                            </div>
                                            <span className="text-[8px] md:text-[9px] xl:text-[11px] font-bold uppercase tracking-tighter text-center leading-none">{mod.label}</span>

                                            {retrieving && (
                                                <>
                                                    {[0, 1, 2].map(p => (
                                                        <motion.div
                                                            key={p}
                                                            className={`absolute w-3 h-3 rounded-full ${mod.particleColor} shadow-[0_0_8px_currentColor] z-10`}
                                                            initial={{ left: '50%', top: '50%', scale: 0, opacity: 0 }}
                                                            animate={{
                                                                x: isMobile ? 0 : desktopXDistance, // Move Right on Desktop (Further on XL)
                                                                y: isMobile ? 180 : desktopYOffset, // Move Down on Mobile
                                                                scale: [0.5, 1, 0.2],
                                                                opacity: [1, 1, 0]
                                                            }}
                                                            transition={{
                                                                duration: 0.8,
                                                                repeat: Infinity,
                                                                delay: p * 0.3,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                )}


                {/* =========================================
             THE BRAIN (Shared)
             Mobile: Middle / Order 2
             Desktop: Center / Col Span 5
             ========================================= */}
                <motion.div
                    layout
                    className={`flex flex-col items-center relative z-20 order-2 md:col-span-5
                ${isBrainCentered ? 'justify-center' : ''} 
             `}
                >
                    <motion.div
                        layout
                        className="relative flex items-center justify-center"
                    >
                        {/* Rotating Rings */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className={`rounded-full border border-dashed border-indigo-200 flex items-center justify-center bg-white/40 backdrop-blur-sm z-10
                       ${scene === 'retrieve' ? 'shadow-[0_0_40px_rgba(99,102,241,0.3)] border-indigo-400' : ''}
                       ${isBrainCentered ? 'w-28 h-28 md:w-36 md:h-36 xl:w-56 xl:h-56' : 'w-32 h-32 md:w-48 md:h-48 xl:w-64 xl:h-64'}
                    `}
                        />
                        <motion.div
                            animate={{ rotate: -360, scale: [1, 1.05, 1] }}
                            transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                            className={`absolute rounded-full border border-dotted border-indigo-300 z-10 opacity-70
                        ${isBrainCentered ? 'w-20 h-20 md:w-28 md:h-28 xl:w-40 xl:h-40' : 'w-24 h-24 md:w-40 md:h-40 xl:w-52 xl:h-52'}
                    `}
                        />

                        {/* Brain Icon */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <BrainIcon className={`text-indigo-600 drop-shadow-md ${scene === 'retrieve' ? 'animate-pulse' : ''} 
                        ${isBrainCentered ? 'w-10 h-10 md:w-14 md:h-14 xl:w-24 xl:h-24' : 'w-14 h-14 md:w-20 md:h-20 xl:w-28 xl:h-28'}
                    `} />
                        </div>

                        {/* Gravity Well */}
                        {scene === 'retrieve' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute w-10 h-10 xl:w-16 xl:h-16 bg-indigo-500 blur-xl rounded-full z-0"
                            />
                        )}
                    </motion.div>

                    {/* Scan Text for Scene 1 */}
                    {!isBrainCentered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs xl:text-sm font-bold text-indigo-500 uppercase tracking-widest mb-1">AI Processor</p>
                            <p className="text-sm xl:text-base text-slate-500">Scanning proficiency...</p>
                        </motion.div>
                    )}

                </motion.div>


                {/* =========================================
             RIGHT SIDE (Schedule / List)
             Mobile: Bottom / Order 3
             Desktop: Right / Col Span 4
             ========================================= */}

                {/* SCENE 1: ANALYSIS LIST (When Brain is NOT Centered) */}
                {!isBrainCentered && (
                    <motion.div
                        initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="order-3 w-full md:w-[320px] xl:w-[450px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
                    >
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs xl:text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                                <SearchIcon className="w-3 h-3 xl:w-4 xl:h-4" /> Diagnostic Report
                            </span>
                            <span className="text-[10px] xl:text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                Live Feed
                            </span>
                        </div>
                        <div className="p-2 space-y-1">
                            {PARTS_DATA.map((part, idx) => {
                                const isScanned = idx <= scannedPartIndex;
                                const isCurrent = idx === scannedPartIndex;

                                return (
                                    <div key={part.id} className="relative flex items-center justify-between p-2 rounded-lg text-xs xl:text-sm">
                                        {/* Background Highlight */}
                                        {isCurrent && (
                                            <motion.div
                                                layoutId="scan-highlight"
                                                className="absolute inset-0 bg-indigo-50 rounded-lg border border-indigo-100"
                                            />
                                        )}

                                        {/* Content */}
                                        <div className="relative z-10 flex flex-col gap-0.5">
                                            <span className={`font-semibold ${isScanned ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {part.name}
                                            </span>
                                            <span className="text-[9px] xl:text-[11px] text-slate-400 font-mono">{part.id}</span>
                                        </div>

                                        <div className="relative z-10 flex items-center gap-3">
                                            {isScanned ? (
                                                <>
                                                    <span className="font-mono font-bold text-slate-700">{part.score}%</span>
                                                    <span className={`text-[9px] xl:text-[11px] px-1.5 py-0.5 rounded border font-medium w-14 xl:w-20 text-center ${getStatusColor(part.status)}`}>
                                                        {part.status}
                                                    </span>
                                                </>
                                            ) : (
                                                <div className="w-20 h-2 bg-slate-100 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* SCENE 2+: SCHEDULE (When Brain IS Centered) */}
                {isBrainCentered && (
                    <div className="order-3 md:col-span-4 flex flex-col gap-4 xl:gap-5 pt-2 relative z-10 pb-10 md:border-l md:border-slate-200/50 pl-0 md:pl-2 xl:pl-6 w-full">
                        <h3 className="text-[10px] xl:text-xs font-bold text-slate-400 uppercase mb-2 pl-1 flex items-center gap-1">
                            Generated Plan
                        </h3>

                        <AnimatePresence>
                            {(scene === 'distribute' || scene === 'completed') && SCHEDULE_DATA.map((item, index) => {
                                const isUnlocked = index <= distributedCount;
                                const isTargeting = index === distributedCount + 1 && scene === 'distribute';

                                // Calculate offsets based on screen size
                                // Adjust X and Y offsets for XL screens

                                const itemHeight = isLargeScreen ? 100 : 70; // Approx height per item
                                const startY = isMobile ? -200 : (2 - index) * itemHeight;
                                const startX = isMobile ? 0 : (isLargeScreen ? -300 : -180);

                                return (
                                    <div key={item.day} className="relative h-14 xl:h-20 w-full">
                                        {isTargeting && (
                                            <motion.div
                                                className="absolute top-1/2 left-0 w-4 h-4 rounded-full bg-indigo-500 z-50 shadow-[0_0_10px_indigo]"
                                                initial={{ x: startX, y: startY, opacity: 0, scale: 0.5 }}
                                                animate={{ x: isMobile ? 0 : -10, y: 0, opacity: [0, 1, 1], scale: 1 }}
                                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                            />
                                        )}

                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={isUnlocked ? { x: 0, opacity: 1 } : { x: 10, opacity: 0.2 }}
                                            className={`
                                        h-full rounded-lg border-l-4 shadow-sm p-3 xl:p-4 flex flex-col justify-center bg-white relative overflow-hidden
                                        ${isUnlocked ? item.color : 'border-slate-300 bg-slate-100'}
                                    `}
                                        >
                                            {isUnlocked && (
                                                <motion.div
                                                    className="absolute inset-0 bg-white z-10"
                                                    initial={{ opacity: 0.8 }}
                                                    animate={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}

                                            {isUnlocked ? (
                                                <div className="flex justify-between items-center w-full z-0">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] xl:text-[11px] uppercase font-bold opacity-60 tracking-wider">{item.day}</span>
                                                        <span className="text-xs xl:text-base font-bold leading-tight text-slate-800">{item.title}</span>
                                                    </div>
                                                    <div className="bg-slate-100 p-1 rounded-full">
                                                        <CheckIcon className="w-3 h-3 xl:w-5 xl:h-5 text-slate-500" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 opacity-30 w-full">
                                                    <div className="h-1.5 w-8 bg-slate-400 rounded-full" />
                                                    <div className="h-2.5 w-20 bg-slate-400 rounded-full" />
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                )
                            })}
                        </AnimatePresence>
                        {scene === 'completed' && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs xl:text-sm font-semibold shadow hover:bg-indigo-700 transition-colors"
                                    onClick={handleClickSeenNewWeek}
                                >
                                    Xem tuần học mới nhất
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PhaseTwoAnalysis;
