
import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import { AnimatePresence, motion } from 'framer-motion';
import PhaseOneGrading from './PhaseOneGrading';
import PhaseTwoAnalysis from './PhaseTwoAnalysis';

interface AssessmentModalProps {
    open: boolean;
    onClose: () => void;
}

export enum Phase {
    GRADING = 1,
    ANALYSIS = 2,
    COMPLETE = 3
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({ open, onClose }) => {
    const [phase, setPhase] = useState<Phase>(Phase.GRADING);

    // Reset phase when modal opens
    useEffect(() => {
        if (open) {
            setPhase(Phase.GRADING);
        }
    }, [open]);

    const handleGradingComplete = () => {
        // Add a small delay before switching for dramatic effect
        setTimeout(() => {
            setPhase(Phase.ANALYSIS);
        }, 500);
    };

    const handleAnalysisComplete = () => {
        setPhase(Phase.COMPLETE);
        // Optional: enable close button here
    };

    return (
        <Dialog
            open={open}
            onClose={phase === Phase.COMPLETE ? onClose : undefined} // Prevent closing during loading
            maxWidth="md"
            fullWidth
            PaperProps={{
                className: "overflow-hidden bg-white relative",
                style: { width: '100%', maxWidth: '900px', margin: '16px' }
            }}
        >
            <div className="h-[90vh] w-full flex flex-col relative overflow-hidden">
                {/* Header Area */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {phase === Phase.GRADING ? "Submitting Assessment" : "Personalizing Your Path"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {phase === Phase.GRADING
                                ? "Our system is grading your answers in real-time."
                                : "AI is analyzing your performance gaps."}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${phase === Phase.GRADING ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                        <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${phase === Phase.ANALYSIS ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                        <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${phase === Phase.COMPLETE ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                </div>

                {/* Content Area with Cross-fade transition */}
                <div className="flex-1 relative bg-slate-50">
                    <AnimatePresence mode="wait">
                        {phase === Phase.GRADING && (
                            <motion.div
                                key="phase-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                                className="absolute inset-0"
                            >
                                <PhaseOneGrading onComplete={handleGradingComplete} />
                            </motion.div>
                        )}

                        {(phase === Phase.ANALYSIS || phase === Phase.COMPLETE) && (
                            <motion.div
                                key="phase-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute inset-0"
                            >
                                <PhaseTwoAnalysis onComplete={handleAnalysisComplete} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Disclaimer */}
                <div className="bg-slate-50 py-2 text-center border-t border-slate-200/50 z-20">
                    <p className="text-[10px] text-slate-400 italic">
                        * Hình ảnh chỉ mang tính chất minh họa
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default AssessmentModal;
