import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMeetRoom } from "../../hooks/useMeetRoom";

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
    };
}

function RemoteVideoTile({ participant }: RemoteVideoTileProps) {
    const { userId, fullname, socketId, micOn, camOn } = participant;
    const displayName = fullname || userId;

    return (
        <motion.div
            key={socketId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
            style={{ aspectRatio: "16 / 9" }}
        >
            <video
                id={`remote-${socketId}`}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-200 ${camOn ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* Avatar overlay when camera is off */}
            {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center"
                    >
                        <PersonIcon style={{ fontSize: 40 }} className="text-white" />
                    </motion.div>
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
export default function MeetRoomPage() {
    const {
        micOn,
        camOn,
        roomId,
        joined,
        participants,
        mediaError,
        selfId,
        selfFullname,
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
    const [roomInput, setRoomInput] = useState("");

    const copyRoomId = () => {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoin = () => {
        const id = roomInput.trim() || `room-${Date.now()}`;
        setRoomInput(id);
        joinRoom(id);
    };

    // ===== PRE-JOIN SCREEN =====
    if (!joined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <motion.div
                    {...fadeInUp}
                    className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-700/50"
                >
                    {/* Header */}
                    <motion.div {...scaleIn} className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <VideocamIcon style={{ fontSize: 32 }} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Video Call</h1>
                        <p className="text-gray-400">Join or create a meeting room</p>
                    </motion.div>

                    {/* Room ID Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Room ID
                            </label>
                            <input
                                type="text"
                                value={roomInput}
                                onChange={e => setRoomInput(e.target.value)}
                                placeholder="Enter room ID or leave empty to create new"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {mediaError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
                                >
                                    <p className="text-red-300 text-sm">{mediaError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Join Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleJoin}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <VideocamIcon />
                            Join Meeting
                        </motion.button>
                    </motion.div>

                    {/* Hint */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center text-gray-500 text-sm mt-6"
                    >
                        Tip: Mic & camera will be requested when you click their buttons
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    // ===== IN-CALL SCREEN =====
    const totalParticipants = participants.length + 1;
    const gridCols =
        totalParticipants <= 1 ? 1 : totalParticipants <= 4 ? 2 : totalParticipants <= 9 ? 3 : 4;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
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
                className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 px-4 py-3 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <h1 className="text-white font-semibold">Meeting Room</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyRoomId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <span className="text-gray-300 text-sm font-mono">{roomId}</span>
                        {copied ? (
                            <CheckIcon style={{ fontSize: 16 }} className="text-green-400" />
                        ) : (
                            <ContentCopyIcon style={{ fontSize: 16 }} className="text-gray-400" />
                        )}
                    </motion.button>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                    <PeopleIcon style={{ fontSize: 18 }} className="text-gray-300" />
                    <span className="text-gray-300 text-sm">{totalParticipants}</span>
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
                            className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-blue-500/80"
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

                            {/* Avatar when camera off */}
                            {!camOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                                    >
                                        <PersonIcon style={{ fontSize: 48 }} className="text-white" />
                                    </motion.div>
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
                            className="bg-gray-800 border-l border-gray-700/50 overflow-hidden"
                        >
                            <div className="p-4">
                                <h2 className="text-white font-semibold mb-4">
                                    Participants ({totalParticipants})
                                </h2>
                                <div className="space-y-2">
                                    {/* Self */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl"
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
                                            className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                <PersonIcon className="text-gray-300" />
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

            {/* Control Bar */}
            <motion.footer
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50 px-4 py-4"
            >
                <div className="flex items-center justify-center gap-4">
                    {/* Mic Button */}
                    <ControlButton
                        onClick={toggleMic}
                        isOn={micOn}
                        activeIcon={<MicIcon className="text-white" />}
                        inactiveIcon={<MicOffIcon className="text-white" />}
                        activeColor="bg-gray-600 hover:bg-gray-500"
                        inactiveColor="bg-red-500 hover:bg-red-400"
                        title={micOn ? "Turn off microphone" : "Turn on microphone"}
                    />

                    {/* Camera Button */}
                    <ControlButton
                        onClick={toggleCamera}
                        isOn={camOn}
                        activeIcon={<VideocamIcon className="text-white" />}
                        inactiveIcon={<VideocamOffIcon className="text-white" />}
                        activeColor="bg-gray-600 hover:bg-gray-500"
                        inactiveColor="bg-red-500 hover:bg-red-400"
                        title={camOn ? "Turn off camera" : "Turn on camera"}
                    />

                    {/* Leave Button */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={leaveRoom}
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
