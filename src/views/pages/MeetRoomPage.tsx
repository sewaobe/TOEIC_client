import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMeetRoom } from "../../hooks/useMeetRoom";
import { useNavigate } from "react-router-dom";

// MUI Icons
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Pagination from "@mui/material/Pagination";

/* =========================
   ANIMATIONS
========================= */
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
};

const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
};

/* =========================
   SUB-COMPONENTS
========================= */
interface ControlButtonProps {
    onClick: () => void;
    isOn: boolean;
    activeIcon: React.ReactNode;
    inactiveIcon: React.ReactNode;
    activeColor: string;
    inactiveColor: string;
    title: string;
}

function ControlButton({
    onClick,
    isOn,
    activeIcon,
    inactiveIcon,
    activeColor,
    inactiveColor,
    title
}: ControlButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${isOn ? activeColor : inactiveColor
                }`}
            title={title}
        >
            {isOn ? activeIcon : inactiveIcon}
        </motion.button>
    );
}

interface RemoteVideoTileProps {
    participant: {
        userId: string;
        fullname?: string;
        socketId: string;
        micOn?: boolean;
        camOn?: boolean;
        isSpeaking?: boolean;
    };
}

interface NativeSpeaker {
    id: string;
    fullname: string;
    country: string;
    specialties: string[];
    rating: number;
}

function RemoteVideoTile({ participant }: RemoteVideoTileProps) {
    const { userId, fullname, socketId, micOn, camOn, isSpeaking } = participant;
    const displayName = fullname || userId;

    return (
        <motion.div
            key={socketId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200"
            style={{ aspectRatio: "16 / 9" }}
        >
            <video
                id={`remote-${socketId}`}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-200 ${camOn ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* Speaking indicator when camera is on */}
            {camOn && micOn && (
                <div className="absolute top-3 left-3">
                    <div className="relative w-6 h-6 flex items-center justify-center">
                        {isSpeaking && (
                            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                        )}
                        <div className="relative w-6 h-6 rounded-full bg-blue-500/90" />
                    </div>
                </div>
            )}

            {/* Avatar overlay when camera is off */}
            {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        {micOn && isSpeaking && (
                            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                        )}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center"
                        >
                            <PersonIcon style={{ fontSize: 40 }} className="text-white" />
                        </motion.div>
                    </div>
                </div>
            )}

            {/* User info bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <motion.span
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-white font-medium"
                >
                    {displayName}
                </motion.span>
                <div className="flex gap-2">
                    <span
                        className={`p-1.5 rounded-full ${micOn ? "bg-green-500/70" : "bg-red-500/70"
                            } backdrop-blur-sm`}
                    >
                        {micOn ? (
                            <MicIcon style={{ fontSize: 16 }} className="text-white" />
                        ) : (
                            <MicOffIcon style={{ fontSize: 16 }} className="text-white" />
                        )}
                    </span>
                    <span
                        className={`p-1.5 rounded-full ${camOn ? "bg-green-500/70" : "bg-red-500/70"
                            } backdrop-blur-sm`}
                    >
                        {camOn ? (
                            <VideocamIcon style={{ fontSize: 16 }} className="text-white" />
                        ) : (
                            <VideocamOffIcon style={{ fontSize: 16 }} className="text-white" />
                        )}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/* =========================
   MAIN COMPONENT
========================= */
interface MeetRoomPageProps {
    onBack?: () => void;
    isNativeHuman?: boolean;
}

export default function MeetRoomPage({ onBack, isNativeHuman = false }: MeetRoomPageProps) {
    const {
        micOn,
        camOn,
        roomId,
        joined,
        participants,
        mediaError,
        selfId,
        selfFullname,
        isSpeaking,
        localVideoRef,
        setRoomId,
        clearMediaError,
        joinRoom,
        leaveRoom,
        toggleMic,
        toggleCamera
    } = useMeetRoom();

    const [showParticipants, setShowParticipants] = useState(false);
    const [copied, setCopied] = useState(false);
    const [nativeSpeakers, setNativeSpeakers] = useState<NativeSpeaker[]>([]);
    const [loadingNatives, setLoadingNatives] = useState(true);
    const [nativesError, setNativesError] = useState<string | null>(null);
    const [selectedNative, setSelectedNative] = useState<NativeSpeaker | null>(null);
    const [incomingRequests, setIncomingRequests] = useState<{ id: string; studentId: string; studentName: string; roomId: string; message?: string }[]>([]);
    const [preJoinPhase, setPreJoinPhase] = useState<"select" | "waiting">("select");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

    const navigate = useNavigate();

    const copyRoomId = () => {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Mock fetch native speakers (replace with real API later)
    useEffect(() => {
        setLoadingNatives(true);
        setNativesError(null);

        const fetchNatives = async () => {
            try {
                const data = await new Promise<NativeSpeaker[]>(resolve => {
                    setTimeout(
                        () =>
                            resolve([
                                {
                                    id: "native-anna",
                                    fullname: "Anna Johnson",
                                    country: "USA",
                                    specialties: ["Interview", "Business", "Daily Conversation"],
                                    rating: 4.9
                                },
                                {
                                    id: "native-liam",
                                    fullname: "Liam Smith",
                                    country: "UK",
                                    specialties: ["Order Coffee", "Restaurant", "Shopping"],
                                    rating: 4.8
                                },
                                {
                                    id: "native-sophia",
                                    fullname: "Sophia Brown",
                                    country: "Canada",
                                    specialties: ["Travel", "Hotel", "Airport"],
                                    rating: 4.7
                                },
                                {
                                    id: "native-noah",
                                    fullname: "Noah Wilson",
                                    country: "Australia",
                                    specialties: ["Job Interview", "Presentation", "Meeting"],
                                    rating: 4.85
                                },
                                {
                                    id: "native-emma",
                                    fullname: "Emma Davis",
                                    country: "USA",
                                    specialties: ["Small Talk", "Networking", "Social Events"],
                                    rating: 4.75
                                },
                                {
                                    id: "native-oliver",
                                    fullname: "Oliver Jones",
                                    country: "UK",
                                    specialties: ["Phone Call", "Email", "Customer Service"],
                                    rating: 4.82
                                },
                                {
                                    id: "native-ava",
                                    fullname: "Ava Taylor",
                                    country: "Canada",
                                    specialties: ["Medical", "Health", "Emergency"],
                                    rating: 4.88
                                },
                                {
                                    id: "native-william",
                                    fullname: "William Brown",
                                    country: "Australia",
                                    specialties: ["Sports", "Fitness", "Hobbies"],
                                    rating: 4.72
                                }
                            ]),
                        500
                    );
                });

                setNativeSpeakers(data);
            } catch (err) {
                console.error("Failed to load native speakers", err);
                setNativesError("Không thể tải danh sách người bản xứ. Vui lòng thử lại.");
            } finally {
                setLoadingNatives(false);
            }
        };

        fetchNatives();
    }, []);

    const handleJoinWithNative = (native: NativeSpeaker) => {
        setSelectedNative(native);
        setPreJoinPhase("waiting");
    };

    const handleCancelNativeRequest = () => {
        setPreJoinPhase("select");
        setSelectedNative(null);
    };

    const handleStartCallNow = () => {
        if (!selectedNative) return;
        const targetRoomId = selectedNative.id;
        joinRoom(targetRoomId);
    };

    const handleRequestLeave = () => {
        setShowLeaveConfirm(true);
    };

    const handleConfirmLeave = async () => {
        await leaveRoom();
        setShowLeaveConfirm(false);
        // Reset pre-join state to speaker selection
        setPreJoinPhase("select");
        setSelectedNative(null);
        setSearchTerm("");
        setPage(1);
    };

    const handleCancelLeave = () => {
        setShowLeaveConfirm(false);
    };

    const handleBackToPractice = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    // mock incoming requests for native human users
    useEffect(() => {
        if (!isNativeHuman) return;
        const mock = [
            { id: 'req-1', studentId: 's1', studentName: 'Nguyen Van A', roomId: 's1-room', message: 'Practice speaking - B1' },
            { id: 'req-2', studentId: 's4', studentName: 'Pham Van D', roomId: 's4-room', message: 'Conversation - A2' }
        ];
        setIncomingRequests(mock);
    }, [isNativeHuman]);

    const handleAcceptRequest = (req: { id: string; studentId: string; studentName: string; roomId: string }) => {
        // in real app notify server; here directly join
        joinRoom(req.roomId);
    };

    const handleDeclineRequest = (id: string) => {
        setIncomingRequests(prev => prev.filter(r => r.id !== id));
    };


    // If native human: show incoming student requests (accept to join their room)
    if (!joined && isNativeHuman) {
        return (
            <div className="min-h-screen flex items-start justify-center py-8">
                <div className="w-full max-w-5xl px-4">
                    <div className="bg-gradient-to-br from-white/80 to-indigo-50/60 rounded-3xl shadow-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">Incoming Call Requests</h2>
                                <p className="text-sm text-gray-500">Students requesting practice with you. Accept to join their room.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        if (onBack) onBack(); else navigate(-1);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                            </div>
                        </div>

                        {incomingRequests.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-600">No incoming requests right now. You'll see them here when students ask for a session.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {incomingRequests.map(req => (
                                    <div key={req.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                                                {req.studentName.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 font-medium truncate">{req.studentName}</p>
                                            <p className="text-sm text-gray-500 truncate">{req.message}</p>
                                            <div className="mt-2 flex gap-2">
                                                <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">New</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDeclineRequest(req.id)}
                                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleAcceptRequest(req)}
                                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-semibold shadow"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ===== PRE-JOIN SCREEN =====
    if (!joined) {
        const filteredSpeakers = nativeSpeakers.filter(speaker => {
            const lowered = searchTerm.toLowerCase();
            const matchesSearch =
                !lowered ||
                speaker.fullname.toLowerCase().includes(lowered) ||
                speaker.country.toLowerCase().includes(lowered) ||
                speaker.specialties.some(s => s.toLowerCase().includes(lowered));
            return matchesSearch;
        });

        const totalPages = Math.ceil(filteredSpeakers.length / itemsPerPage);
        const paginatedSpeakers = filteredSpeakers.slice(
            (page - 1) * itemsPerPage,
            page * itemsPerPage
        );

        const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
            setPage(value);
        };

        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col">
                <div className="max-w-6xl mx-auto w-full px-4 py-8 md:py-12 relative">
                    {onBack && (
                        <button
                            onClick={handleBackToPractice}
                            className="absolute -top-2 left-0 md:-top-4 md:-left-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </button>
                    )}

                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 px-4 md:px-8 py-6 md:py-8 space-y-8">
                        {/* Top header */}
                        <motion.div
                            {...fadeInUp}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <VideocamIcon style={{ fontSize: 28 }} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Video Call
                                    </h1>
                                    <p className="text-gray-600 text-sm md:text-base">
                                        Kết nối với người bản xứ để luyện nghe và nói.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2">
                                {mediaError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 max-w-sm">
                                        <p className="text-red-600 text-xs md:text-sm">
                                            {mediaError}
                                        </p>
                                    </div>
                                )}
                                <p className="text-gray-500 text-xs md:text-sm">
                                    Mic & camera sẽ được yêu cầu khi bạn bắt đầu cuộc gọi.
                                </p>
                            </div>
                        </motion.div>

                        {/* Search bar */}
                        {preJoinPhase === "select" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl px-4 py-3 md:px-6 md:py-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-700 text-sm font-medium whitespace-nowrap">
                                        Tìm kiếm
                                    </span>
                                    <input
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Tìm theo tên, quốc gia hoặc chuyên môn..."
                                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {preJoinPhase === "select" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {nativesError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                        <p className="text-red-600 text-sm">{nativesError}</p>
                                    </div>
                                )}

                                {loadingNatives ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Array.from({ length: 6 }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className="animate-pulse rounded-2xl bg-gray-200 h-28 border border-gray-300"
                                            />
                                        ))}
                                    </div>
                                ) : filteredSpeakers.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-8">
                                        Không tìm thấy người bản xứ phù hợp.
                                    </p>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {paginatedSpeakers.map(speaker => (
                                                <motion.button
                                                    key={speaker.id}
                                                    whileHover={{ y: -4, scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleJoinWithNative(speaker)}
                                                    className="w-full text-left bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-2xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0">
                                                            {speaker.fullname.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-gray-900 text-sm font-semibold truncate">
                                                                {speaker.fullname}
                                                            </p>
                                                            <p className="text-gray-600 text-xs truncate">
                                                                {speaker.country}
                                                            </p>
                                                            <p className="text-yellow-500 text-xs mt-0.5">
                                                                ★ {speaker.rating.toFixed(1)}
                                                            </p>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[11px] font-medium flex-shrink-0">
                                                            Online
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {speaker.specialties.map((specialty, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium"
                                                            >
                                                                {specialty}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex justify-center mt-6">
                                                <Pagination
                                                    count={totalPages}
                                                    page={page}
                                                    onChange={handlePageChange}
                                                    color="primary"
                                                    size="large"
                                                    showFirstButton
                                                    showLastButton
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {preJoinPhase === "waiting" && selectedNative && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-16 gap-6"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/60 animate-ping" />
                                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                                            {selectedNative.fullname.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-600 text-sm mb-1">Đang gửi yêu cầu tới</p>
                                        <p className="text-gray-900 text-xl font-semibold">
                                            {selectedNative.fullname}
                                        </p>
                                        <p className="text-gray-600 text-xs mt-1">
                                            {selectedNative.country}
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                                            {selectedNative.specialties.map((specialty, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm max-w-md text-center">
                                    Vui lòng chờ người bản xứ chấp nhận cuộc gọi của bạn. Bạn có thể hủy yêu cầu bất kỳ lúc nào.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                                    <button
                                        onClick={handleCancelNativeRequest}
                                        className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-300 transition-colors"
                                    >
                                        Hủy yêu cầu
                                    </button>
                                    <button
                                        onClick={handleStartCallNow}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg transition-all"
                                    >
                                        Bắt đầu cuộc gọi ngay (demo)
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ===== IN-CALL SCREEN =====
    const totalParticipants = participants.length + 1;
    const gridCols =
        totalParticipants <= 1 ? 1 : totalParticipants <= 4 ? 2 : totalParticipants <= 9 ? 3 : 4;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col">
            {/* Error Toast - for permission denied etc */}
            <AnimatePresence>
                {mediaError && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 left-1/3 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md"
                    >
                        <span className="text-sm">{mediaError}</span>
                        <button
                            onClick={clearMediaError}
                            className="text-white/80 hover:text-white text-lg font-bold"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRequestLeave}
                        className="p-2 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-colors"
                    >
                        <ArrowBackIcon style={{ fontSize: 20 }} />
                    </motion.button>
                    <h1 className="text-gray-900 font-semibold">Meeting Room</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyRoomId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                    >
                        <span className="text-gray-700 text-sm font-mono">{roomId}</span>
                        {copied ? (
                            <CheckIcon style={{ fontSize: 16 }} className="text-green-600" />
                        ) : (
                            <ContentCopyIcon style={{ fontSize: 16 }} className="text-gray-500" />
                        )}
                    </motion.button>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                    <PeopleIcon style={{ fontSize: 18 }} className="text-gray-700" />
                    <span className="text-gray-700 text-sm">{totalParticipants}</span>
                </motion.button>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Video Grid */}
                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 p-4"
                >
                    <div
                        className={`grid gap-4 h-full`}
                        style={{
                            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                            gridAutoRows: "1fr"
                        }}
                    >
                        {/* Local Video */}
                        <motion.div
                            layout
                            className="relative bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-blue-500"
                            style={{ aspectRatio: "16 / 9" }}
                        >
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover transition-opacity duration-200 ${camOn ? "opacity-100" : "opacity-0"
                                    }`}
                            />

                            {/* Speaking indicator when camera is on (self) */}
                            {camOn && micOn && (
                                <div className="absolute top-3 left-3">
                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                        {isSpeaking && (
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                                        )}
                                        <div className="relative w-7 h-7 rounded-full bg-blue-500/90" />
                                    </div>
                                </div>
                            )}

                            {/* Avatar when camera off */}
                            {!camOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        {micOn && isSpeaking && (
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                                        )}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                                        >
                                            <PersonIcon style={{ fontSize: 48 }} className="text-white" />
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {/* Self label */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg"
                            >
                                <span className="text-sm text-white font-medium">{selfFullname || "Me"}</span>
                            </motion.div>

                            {/* Local media indicators */}
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                <span
                                    className={`p-1.5 rounded-full ${micOn ? "bg-green-500/70" : "bg-red-500/70"
                                        } backdrop-blur-sm`}
                                >
                                    {micOn ? (
                                        <MicIcon style={{ fontSize: 16 }} className="text-white" />
                                    ) : (
                                        <MicOffIcon style={{ fontSize: 16 }} className="text-white" />
                                    )}
                                </span>
                            </div>
                        </motion.div>

                        {/* Remote Videos */}
                        <AnimatePresence>
                            {participants.map(p => (
                                <RemoteVideoTile key={p.socketId} participant={p} />
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.main>

                {/* Participants Sidebar */}
                <AnimatePresence>
                    {showParticipants && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white border-l border-gray-200 overflow-hidden shadow-lg"
                        >
                            <div className="p-4">
                                <h2 className="text-gray-900 font-semibold mb-4">
                                    Participants ({totalParticipants})
                                </h2>
                                <div className="space-y-2">
                                    {/* Self */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-3 p-3 bg-slate-800/70 rounded-xl"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <PersonIcon className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{selfFullname || "Me"}</p>
                                            <p className="text-gray-400 text-xs truncate">{selfId}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {micOn ? (
                                                <MicIcon style={{ fontSize: 18 }} className="text-green-400" />
                                            ) : (
                                                <MicOffIcon style={{ fontSize: 18 }} className="text-red-400" />
                                            )}
                                            {camOn ? (
                                                <VideocamIcon style={{ fontSize: 18 }} className="text-green-400" />
                                            ) : (
                                                <VideocamOffIcon style={{ fontSize: 18 }} className="text-red-400" />
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Others */}
                                    {participants.map((p, idx) => (
                                        <motion.div
                                            key={p.socketId}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: (idx + 1) * 0.05 }}
                                            className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                <PersonIcon className="text-slate-200" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium">{p.fullname || p.userId}</p>
                                                <p className="text-gray-400 text-xs truncate">{p.socketId}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {p.micOn ? (
                                                    <MicIcon style={{ fontSize: 18 }} className="text-green-400" />
                                                ) : (
                                                    <MicOffIcon style={{ fontSize: 18 }} className="text-red-400" />
                                                )}
                                                {p.camOn ? (
                                                    <VideocamIcon style={{ fontSize: 18 }} className="text-green-400" />
                                                ) : (
                                                    <VideocamOffIcon style={{ fontSize: 18 }} className="text-red-400" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Leave confirmation modal */}
            <AnimatePresence>
                {showLeaveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200"
                        >
                            <h2 className="text-gray-900 text-lg font-semibold mb-2">
                                Bạn muốn kết thúc cuộc gọi này?
                            </h2>
                            <p className="text-gray-600 text-sm mb-6">
                                Dữ liệu sẽ bắt đầu được phân tích sau khi bạn kết thúc cuộc gọi.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCancelLeave}
                                    className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmLeave}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md transition-colors"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control Bar */}
            <motion.footer
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-4 shadow-lg"
            >
                <div className="flex items-center justify-center gap-4">
                    {/* Mic Button */}
                    <ControlButton
                        onClick={toggleMic}
                        isOn={micOn}
                        activeIcon={<MicIcon className="text-white" />}
                        inactiveIcon={<MicOffIcon className="text-white" />}
                        activeColor="bg-blue-600 hover:bg-blue-500"
                        inactiveColor="bg-red-500 hover:bg-red-400"
                        title={micOn ? "Turn off microphone" : "Turn on microphone"}
                    />

                    {/* Camera Button */}
                    <ControlButton
                        onClick={toggleCamera}
                        isOn={camOn}
                        activeIcon={<VideocamIcon className="text-white" />}
                        inactiveIcon={<VideocamOffIcon className="text-white" />}
                        activeColor="bg-blue-600 hover:bg-blue-500"
                        inactiveColor="bg-red-500 hover:bg-red-400"
                        title={camOn ? "Turn off camera" : "Turn on camera"}
                    />

                    {/* Leave Button */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRequestLeave}
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors shadow-lg"
                        title="Leave meeting"
                    >
                        <CallEndIcon className="text-white" />
                    </motion.button>
                </div>
            </motion.footer>
        </div>
    );
}
