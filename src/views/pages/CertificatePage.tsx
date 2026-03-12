import React, { useEffect, useState, useRef } from 'react';
import { Close, CheckCircle, QrCode2, MoreVert, LocalPrintshop } from '@mui/icons-material';

// --- Types & Interfaces ---

export type ToeicAssessmentType = "MOCK_TEST" | "FINAL_TEST";
export type CertificateStatus = "PASSED" | "COMPLETED" | "PARTICIPATED";

export interface ToeicScore {
    listening: number; // 5..495
    reading: number;   // 5..495
    total: number;     // 10..990
}

export interface ToeicCertificateData {
    certificateNo: string;
    issuedAt: string;
    verificationCode?: string;
    verificationUrl?: string;
    student: {
        fullName: string;
        candidateId?: string;
    };
    course: {
        name: string;
        targetBand?: string;
        hours?: number;
    };
    assessment: {
        type: ToeicAssessmentType;
        takenAt: string;
        score: ToeicScore;
        accuracy?: number;
    };
    status: CertificateStatus;
    remark?: string;
    issuer: {
        platformName: string;
        instructorName: string;
        headName?: string;
    };
}

import { useReactToPrint } from 'react-to-print';

// printable component (render ẩn, không scale)
const CertificatePrintable = React.forwardRef<HTMLDivElement, { data: ToeicCertificateData }>(
    ({ data }, ref) => {
        // A4 landscape ~ 1123x794 @ 96dpi (thực dụng cho print)
        const W = 1123;
        const H = 794;
        const isPortrait = false;

        return (
            <div
                ref={ref}
                style={{
                    width: `${W}px`,
                    height: `${H}px`,
                    background: 'white',
                    overflow: 'hidden',
                }}
            >
                <div
                    className="relative bg-white text-slate-900 overflow-hidden"
                    style={{ width: `${W}px`, height: `${H}px` }}
                >
                    {/* --- Background Geometric Shapes --- */}
                    <div className="absolute top-0 left-0 w-[40%] h-[35%] bg-[#8FD6E8]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                    <div className="absolute top-0 right-0 w-[60%] h-[35%] bg-[#F29C8E]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%)' }} />
                    <div className="absolute bottom-0 left-0 w-[60%] h-[25%] bg-[#F29C8E]" style={{ clipPath: 'polygon(0 100%, 0 0, 80% 100%)' }} />
                    <div className="absolute bottom-0 right-0 w-[40%] h-[25%] bg-[#8FD6E8]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

                    {/* --- Internal Content --- */}
                    {/* Giữ đúng layout desktop (isPortrait=false), dùng padding desktop */}
                    <div className="relative z-10 flex flex-col h-full w-full py-10 px-14">

                        {/* 1. Header Section */}
                        <div className="text-center">
                            <div className="text-xs font-bold text-gray-500 tracking-[0.3em] uppercase mb-2">
                                {data.issuer.platformName}
                            </div>
                            <h1 className="text-7xl font-sans font-bold text-gray-900 tracking-tight leading-none">
                                CERTIFICATE
                            </h1>
                            <div className="text-base font-sans text-gray-600 tracking-[0.4em] uppercase font-medium mt-2">
                                of Completion
                            </div>
                        </div>

                        {/* 2. Banner */}
                        <div className="bg-[#F29C8E] text-white py-2 mx-auto shadow-sm transform -skew-x-12 inline-block my-5 px-20">
                            <span className="block font-medium text-base tracking-wide transform skew-x-12 px-2 uppercase">
                                Presented To
                            </span>
                        </div>

                        {/* 3. Student Name */}
                        <div className="text-center -mt-1 mb-4">
                            <div className="font-signature text-gray-900 leading-none py-2 px-4 text-[6.5rem]">
                                {data.student.fullName}
                            </div>
                        </div>

                        {/* 4. Layout: Course & Score (desktop grid) */}
                        <div className="flex-1 border-t border-b border-gray-100/50 my-2 py-4 grid grid-cols-2 gap-0 items-center">
                            {/* Course Info */}
                            <div className="pr-12 text-right border-r border-gray-200 h-full flex flex-col justify-center">
                                <p className="text-slate-500 text-base mb-2 font-medium">Successfully completed the program</p>
                                <h3 className="text-3xl font-bold text-slate-800 leading-tight mb-3">
                                    {data.course.name}
                                </h3>
                                <div className="text-sm text-slate-400 font-mono space-y-1.5 mt-2">
                                    <p>ID: {data.certificateNo}</p>
                                    <p>Issued: {data.issuedAt}</p>
                                </div>
                            </div>

                            {/* Assessment Results */}
                            <div className="pl-12 text-left h-full flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="text-indigo-500" style={{ fontSize: 20 }} />
                                    <span className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
                                        Assessment Result
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">Listening</div>
                                        <div className="text-xl font-bold text-slate-700">{data.assessment.score.listening}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">Reading</div>
                                        <div className="text-xl font-bold text-slate-700">{data.assessment.score.reading}</div>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-center shadow-sm">
                                        <div className="text-[11px] font-bold text-indigo-400 uppercase">Total</div>
                                        <div className="text-2xl font-black text-indigo-600 leading-none mt-1">{data.assessment.score.total}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Footer (desktop) */}
                        <div className="flex justify-between items-end mt-auto pt-6 px-6">
                            <div className="flex flex-col items-center w-56">
                                <div className="font-signature text-gray-800 border-b border-gray-300 w-full text-center pb-2 text-4xl">
                                    {data.issuer.instructorName}
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Instructor
                                </div>
                            </div>

                            <div className="relative flex flex-col items-center -mb-8 mx-6">
                                <div className="w-24 h-24 border-4 bg-[#5BB4E5] text-white rounded-full flex items-center justify-center shadow-lg border-white">
                                    <div className="text-center">
                                        <div className="text-3xl font-extrabold">{data.assessment.score.total}</div>
                                        <div className="text-[0.6rem] font-bold uppercase tracking-wider">Score</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center w-56">
                                <div className="font-signature text-gray-800 border-b border-gray-300 w-full text-center pb-2 text-4xl">
                                    {data.issuer.headName}
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Director
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
);

// --- Main Certificate Component ---
const CertificatePage: React.FC = () => {
    const [scale, setScale] = useState(1);
    const [isPortrait, setIsPortrait] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Sample Data (for demo purposes)
    const data: ToeicCertificateData = {
        certificateNo: "TOEIC-2026-000128",
        issuedAt: "2026-02-01",
        verificationCode: "9H2K-7QXA",
        verificationUrl: "https://eduplatform.vn/verify/9H2K-7QXA",

        student: {
            fullName: "Nguyễn Minh Anh",
            candidateId: "SV2026-0142",
        },

        course: {
            name: "TOEIC 650+ Intensive",
            targetBand: "650+",
            hours: 48,
        },

        assessment: {
            type: "FINAL_TEST",
            takenAt: "2026-01-30",
            score: {
                listening: 360,
                reading: 315,
                total: 675,
            },
            accuracy: 78,
        },

        status: "PASSED",
        remark: "Achieved target band and successfully completed the TOEIC program.",

        issuer: {
            platformName: "EduPlatform Association",
            instructorName: "Ms. Trần Thảo Vy",
            headName: "Dr. Nguyễn Quang Thành",
        },
    };
    // CONSTANTS
    const LANDSCAPE_WIDTH = 1000;
    const LANDSCAPE_HEIGHT = 760;

    const PORTRAIT_WIDTH = 600;
    const PORTRAIT_HEIGHT = 860;

    const SAFE_MARGIN = 20;

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Determine orientation based on available width
            // If width is narrow (< 768px), switch to Portrait layout for readability
            const mobile = vw < 768;
            setIsPortrait(mobile);

            const targetW = mobile ? PORTRAIT_WIDTH : LANDSCAPE_WIDTH;
            const targetH = mobile ? PORTRAIT_HEIGHT : LANDSCAPE_HEIGHT;

            const availableWidth = vw - (SAFE_MARGIN * 2);
            const availableHeight = vh - (SAFE_MARGIN * 2);

            const scaleX = availableWidth / targetW;
            const scaleY = availableHeight / targetH;

            // Fit to whichever dimension is tighter
            // Allow slightly larger max scale to fill screen nicely
            const newScale = Math.min(scaleX, scaleY, 1.1);
            setScale(Math.max(newScale, 0.25));
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const reactToPrintFn = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${data.certificateNo}-${data.student.fullName}`,
        pageStyle: `
      @page { size: A4 landscape; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
    });

    const handlePrint = () => {
        setMenuOpen(false);

        reactToPrintFn && reactToPrintFn();
    };

    const handleGenerateQR = () => {
        console.log("Generating QR Code for:", data.certificateNo);
        setMenuOpen(false);
    };

    // Derived dimensions for render
    const currentWidth = isPortrait ? PORTRAIT_WIDTH : LANDSCAPE_WIDTH;
    const currentHeight = isPortrait ? PORTRAIT_HEIGHT : LANDSCAPE_HEIGHT;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100/95 flex flex-col items-center justify-center animate-fade-in">

            {/* --- Main Viewport Area --- */}
            <div
                ref={containerRef}
                className="w-full h-full relative flex items-center justify-center overflow-hidden"
            >
                {/* 
                   CERTIFICATE CANVAS
                */}
                <div
                    className="relative bg-white text-slate-900 shadow-2xl overflow-hidden print-reset print:shadow-none transition-all duration-300 ease-out origin-center"
                    style={{
                        width: `${currentWidth}px`,
                        height: `${currentHeight}px`,
                        transform: `scale(${scale})`,
                    }}
                >
                    {/* --- Background Geometric Shapes --- */}
                    <div className="absolute top-0 left-0 w-[40%] h-[35%] bg-[#8FD6E8]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                    <div className="absolute top-0 right-0 w-[60%] h-[35%] bg-[#F29C8E]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%)' }}></div>
                    <div className="absolute bottom-0 left-0 w-[60%] h-[25%] bg-[#F29C8E]" style={{ clipPath: 'polygon(0 100%, 0 0, 80% 100%)' }}></div>
                    <div className="absolute bottom-0 right-0 w-[40%] h-[25%] bg-[#8FD6E8]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>

                    {/* --- Internal Content --- */}
                    <div className={`relative z-10 flex flex-col h-full w-full ${isPortrait ? 'py-8 px-8' : 'py-10 px-14'}`}>

                        {/* 1. Header Section */}
                        <div className="text-center">
                            <div className="text-xs font-bold text-gray-500 tracking-[0.3em] uppercase mb-2">
                                {data.issuer.platformName}
                            </div>
                            <h1 className={`${isPortrait ? 'text-6xl' : 'text-7xl'} font-sans font-bold text-gray-900 tracking-tight leading-none`}>
                                CERTIFICATE
                            </h1>
                            <div className="text-base font-sans text-gray-600 tracking-[0.4em] uppercase font-medium mt-2">
                                of Completion
                            </div>
                        </div>

                        {/* 2. Banner */}
                        <div className={`bg-[#F29C8E] text-white py-2 mx-auto shadow-sm transform -skew-x-12 inline-block ${isPortrait ? 'my-4 px-12' : 'my-5 px-20'}`}>
                            <span className="block font-medium text-base tracking-wide transform skew-x-12 px-2 uppercase">
                                Presented To
                            </span>
                        </div>

                        {/* 3. Student Name */}
                        <div className="text-center -mt-1 mb-4">
                            <div className={`font-signature text-gray-900 leading-none py-2 px-4 ${isPortrait ? 'text-[4.5rem]' : 'text-[6.5rem]'}`}>
                                {data.student.fullName}
                            </div>
                        </div>

                        {/* 4. Layout: Course & Score */}
                        {/* Mobile: Stacked Vertical | Desktop: Horizontal Split */}
                        <div className={`flex-1 border-t border-b border-gray-100/50 my-2 py-4 ${isPortrait ? 'flex flex-col justify-center gap-6' : 'grid grid-cols-2 gap-0 items-center'}`}>

                            {/* Course Info */}
                            <div className={`${isPortrait ? 'text-center px-4 border-b border-gray-100 pb-4' : 'pr-12 text-right border-r border-gray-200 h-full flex flex-col justify-center'}`}>
                                <p className="text-slate-500 text-base mb-2 font-medium">Successfully completed the program</p>
                                <h3 className={`${isPortrait ? 'text-2xl' : 'text-3xl'} font-bold text-slate-800 leading-tight mb-3`}>
                                    {data.course.name}
                                </h3>
                                <div className="text-sm text-slate-400 font-mono space-y-1.5 mt-2">
                                    <p>ID: {data.certificateNo}</p>
                                    <p>Issued: {data.issuedAt}</p>
                                </div>
                            </div>

                            {/* Assessment Results */}
                            <div className={`${isPortrait ? 'px-4' : 'pl-12 text-left h-full flex flex-col justify-center'}`}>
                                <div className={`flex items-center gap-2 mb-4 ${isPortrait ? 'justify-center' : ''}`}>
                                    <CheckCircle className="text-indigo-500" style={{ fontSize: 20 }} />
                                    <span className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
                                        Assessment Result
                                    </span>
                                </div>

                                <div className={`grid gap-4 ${isPortrait ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-5'}`}>
                                    {/* Listening */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                        <div className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase">Listening</div>
                                        <div className="text-lg md:text-xl font-bold text-slate-700">{data.assessment.score.listening}</div>
                                    </div>
                                    {/* Reading */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                        <div className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase">Reading</div>
                                        <div className="text-lg md:text-xl font-bold text-slate-700">{data.assessment.score.reading}</div>
                                    </div>
                                    {/* Total */}
                                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-center col-span-1 shadow-sm">
                                        <div className="text-[10px] md:text-[11px] font-bold text-indigo-400 uppercase">Total</div>
                                        <div className="text-xl md:text-2xl font-black text-indigo-600 leading-none mt-1">{data.assessment.score.total}</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* 5. Footer */}
                        <div className={`flex justify-between items-end mt-auto ${isPortrait ? 'pt-4 px-0' : 'pt-6 px-6'}`}>
                            {/* Left Signature */}
                            <div className={`flex flex-col items-center ${isPortrait ? 'w-32' : 'w-56'}`}>
                                <div className={`font-signature text-gray-800 border-b border-gray-300 w-full text-center pb-2 ${isPortrait ? 'text-2xl' : 'text-4xl'}`}>
                                    {data.issuer.instructorName} {/* Show only last name on mobile if tight? No, let's keep full but scale font */}
                                </div>
                                <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Instructor
                                </div>
                            </div>

                            {/* Center Seal */}
                            <div className={`relative flex flex-col items-center ${isPortrait ? '-mb-4 mx-2' : '-mb-8 mx-6'}`}>
                                <div className={`${isPortrait ? 'w-20 h-20 border-2' : 'w-24 h-24 border-4'} bg-[#5BB4E5] text-white rounded-full flex items-center justify-center shadow-lg border-white`}>
                                    <div className="text-center">
                                        <div className={`${isPortrait ? 'text-2xl' : 'text-3xl'} font-extrabold`}>{data.assessment.score.total}</div>
                                        <div className="text-[0.6rem] font-bold uppercase tracking-wider">Score</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Signature */}
                            <div className={`flex flex-col items-center ${isPortrait ? 'w-32' : 'w-56'}`}>
                                <div className={`font-signature text-gray-800 border-b border-gray-300 w-full text-center pb-2 ${isPortrait ? 'text-2xl' : 'text-4xl'}`}>
                                    {data.issuer.headName}
                                </div>
                                <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Director
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- Floating Action Button --- */}
            <div className="fixed bottom-6 right-6 z-[120] print:hidden flex flex-col items-end gap-3">
                <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}>
                    <button onClick={handleGenerateQR} className="group flex items-center gap-3 pr-1">
                        <span className="bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Generate QR</span>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-slate-700 hover:text-indigo-600 rounded-full shadow-lg flex items-center justify-center transition-colors">
                            <QrCode2 fontSize="small" />
                        </div>
                    </button>
                    <button onClick={handlePrint} className="group flex items-center gap-3 pr-1">
                        <span className="bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Print</span>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-slate-700 hover:text-indigo-600 rounded-full shadow-lg flex items-center justify-center transition-colors">
                            <LocalPrintshop fontSize="small" />
                        </div>
                    </button>
                </div>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 ${menuOpen ? 'bg-indigo-500 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {menuOpen ? <Close fontSize="small" /> : <MoreVert fontSize="medium" />}
                </button>
            </div>
            {/* Hidden printable area (không ảnh hưởng UI) */}
            <div style={{ position: 'fixed', left: -99999, top: 0 }}>
                <CertificatePrintable ref={printRef} data={data} />
            </div>
        </div>
    );
};

export default CertificatePage;