
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { initSocket, getSocket } from '../../services/socket.service';
import { CheckIcon } from '../common/Icons.tsx';

interface PhaseOneProps {
    onComplete: () => void;
}

interface QuestionStatus {
    id: number;
    status: 'pending' | 'scanning' | 'correct' | 'incorrect';
}

const TOTAL_QUESTIONS = 100;
const SCAN_DURATION_MS = 40; // Slower speed: ~8 seconds total for 100 items

const PhaseOneGrading: React.FC<PhaseOneProps> = ({ onComplete }) => {
    const [questions, setQuestions] = useState<QuestionStatus[]>(
        Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
            id: i + 1,
            status: 'pending',
        }))
    );

    const [totalQuestions, setTotalQuestions] = useState<number>(TOTAL_QUESTIONS);
    const [scanningIndex, setScanningIndex] = useState(0);
    const [startScanning, setStartScanning] = useState(false);
    const [serverResults, setServerResults] = useState<('correct' | 'incorrect' | null)[] | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Socket: wait for server grading result before starting per-question animation
    useEffect(() => {
        const sock = getSocket() || initSocket();

        const handleMiniTest = (payload: any) => {
            try {
                const detailed = payload?.detailedAnswers;
                const total = payload?.totalQuestions ?? (Array.isArray(detailed) ? detailed.length : undefined);

                if (Array.isArray(detailed) && total) {
                    setTotalQuestions(total);

                    const results = detailed.map((d: any) => {
                        if (typeof d.isCorrect === 'boolean') return d.isCorrect ? 'correct' : 'incorrect';
                        return null;
                    });

                    // initialize question list (pending) and set server results
                    setQuestions(Array.from({ length: total }, (_, i) => ({ id: i + 1, status: 'pending' })));
                    setServerResults(results as any);
                    setScanningIndex(0);
                    setStartScanning(true);
                }
            } catch (err) {
                console.warn('Failed to process mini_test_submitted payload', err);
            }
        };

        sock?.off('mini_test_submitted', handleMiniTest);
        sock?.on('mini_test_submitted', handleMiniTest);

        return () => {
            sock?.off('mini_test_submitted', handleMiniTest);
        };
    }, [onComplete]);

    // Animation & Scroll Logic
    useEffect(() => {
        // do not run scanning until server data arrives
        if (!startScanning) return;

        // Check completion
        if (scanningIndex > totalQuestions) {
            const finishTimer = setTimeout(() => {
                onComplete();
            }, 800);
            return () => clearTimeout(finishTimer);
        }

        // Auto-scroll logic: Keep the scanning item centered
        if (scanningIndex > 0 && scanningIndex <= totalQuestions) {
            const activeNode = document.getElementById(`question-node-${scanningIndex - 1}`);
            if (activeNode && scrollContainerRef.current) {
                activeNode.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center', // Keeps the active item vertically centered
                    inline: 'nearest'
                });
            }
        }

        const timer = setTimeout(() => {
            setQuestions(prev => {
                const newQuestions = [...prev];

                // 1. Mark previous item as Done (Result) using serverResults when available
                if (scanningIndex > 0 && scanningIndex <= totalQuestions) {
                    const prevIndex = scanningIndex - 1;
                    if (serverResults && serverResults[prevIndex] != null) {
                        newQuestions[prevIndex] = {
                            ...newQuestions[prevIndex],
                            status: serverResults[prevIndex] as 'correct' | 'incorrect'
                        };
                    }
                }

                // 2. Mark current item as Scanning (Focus)
                if (scanningIndex < totalQuestions) {
                    newQuestions[scanningIndex] = {
                        ...newQuestions[scanningIndex],
                        status: 'scanning'
                    };
                }
                return newQuestions;
            });

            setScanningIndex(prev => prev + 1);
        }, SCAN_DURATION_MS);

        return () => clearTimeout(timer);
    }, [scanningIndex, onComplete, startScanning, serverResults, totalQuestions]);

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 relative">

            {/* Sticky Header Status Bar */}
            <div className="w-full px-6 py-4 xl:py-6 bg-slate-50/95 backdrop-blur z-20 border-b border-slate-200 sticky top-0 flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                    <h3 className="text-sm xl:text-lg font-bold text-slate-700 uppercase tracking-wider">
                        Grading Progress
                    </h3>
                    <span className="text-xs xl:text-sm text-slate-500 font-mono mt-1">
                        {!startScanning
                            ? 'Waiting for grading results...'
                            : scanningIndex < totalQuestions
                                ? `Scanning Question: ${scanningIndex + 1} / ${totalQuestions}`
                                : 'Grading Complete'
                        }
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="w-32 md:w-48 xl:w-64 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${startScanning && totalQuestions > 0 ? (Math.min(scanningIndex, totalQuestions) / totalQuestions) * 100 : 0}%` }}
                        transition={{ ease: "linear" }}
                    />
                </div>
            </div>

            {/* Scrollable Grid Container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-10 scroll-smooth no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                    <div className="flex justify-center pb-20"> {/* pb-20 adds buffer for bottom items */}
                    {/* RESPONSIVE GRID: 5 cols on mobile, 10 on desktop. Increased max-width for XL screens */}
                    { !startScanning ? (
                        <div className="w-full flex items-center justify-center p-8">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600" />
                                <div className="text-sm text-slate-500">Đang chấm bài, vui lòng chờ...</div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3 xl:gap-4 w-full max-w-[500px] xl:max-w-[800px]">
                            {questions.map((q, index) => {
                            const isScanning = index === scanningIndex;
                            const isPending = q.status === 'pending';
                            const isDone = q.status === 'correct' || q.status === 'incorrect';

                            return (
                                <div
                                    key={q.id}
                                    id={`question-node-${index}`} // ID for scroll targeting
                                    className="relative aspect-square flex items-center justify-center"
                                >
                                    <motion.div
                                        className={`
                                    relative flex items-center justify-center rounded-md cursor-default
                                    transition-all duration-300 ease-out
                                    ${isPending ? 'bg-slate-200 w-2.5 h-2.5 xl:w-3.5 xl:h-3.5 rounded-full' : ''} 
                                    ${isDone ? 'w-full h-full shadow-sm border' : ''}
                                    ${q.status === 'correct' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : ''}
                                    ${q.status === 'incorrect' ? 'bg-rose-50 border-rose-200 text-rose-500' : ''}
                                `}
                                        // Subtle highlight instead of large zoom to avoid "laggy" feel
                                        animate={isScanning ? {
                                            scale: 1.12,
                                            zIndex: 10,
                                            boxShadow: "0px 0px 14px rgba(99, 102, 241, 0.35)",
                                            borderRadius: "8px",
                                            border: "2px solid #6366f1"
                                        } : {
                                            scale: 1,
                                            zIndex: 1,
                                            boxShadow: "none",
                                            border: undefined,
                                        }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    >
                                        {/* PENDING STATE: Dot */}
                                        {isPending && !isScanning && (
                                            <div className="w-full h-full rounded-full opacity-40 bg-slate-400" />
                                        )}

                                        {/* SCANNING STATE: Show "Q.1" */}
                                        {isScanning && (
                                            <motion.div
                                                className="flex flex-col items-center justify-center w-full h-full"
                                                initial={false} // không re-animate từ đầu mỗi lần
                                                animate={{ opacity: 1 }}
                                            >
                                                <span className="text-[11px] xl:text-sm font-extrabold text-indigo-600 whitespace-nowrap">
                                                    Q.{q.id}
                                                </span>
                                            </motion.div>
                                        )}

                                        {/* DONE STATE: Result */}
                                        {isDone && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center justify-center"
                                            >
                                                {q.status === 'correct' ? (
                                                    <CheckIcon className="w-4 h-4 xl:w-6 xl:h-6" />
                                                ) : (
                                                    <span className="text-xs xl:text-base font-black font-mono">X</span>
                                                )}
                                                {/* Optional: Show tiny number if corrected */}
                                                <span className={`text-[8px] xl:text-[10px] mt-[1px] font-bold opacity-60`}>
                                                    {q.id}
                                                </span>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhaseOneGrading;
