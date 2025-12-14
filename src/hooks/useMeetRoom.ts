import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket, initSocket } from "../services/socket.service";
import { rtcConfig } from "../utils/webrtc";

/* =========================
   TYPES
========================= */
export interface Participant {
    userId: string;        // internal id
    fullname: string;     // display name
    socketId: string;
    micOn?: boolean;
    camOn?: boolean;
    isSpeaking?: boolean;
}

interface WebRTCOffer {
    from: string;
    offer: RTCSessionDescriptionInit;
}

interface WebRTCAnswer {
    from: string;
    answer: RTCSessionDescriptionInit;
}

interface WebRTCIce {
    from: string;
    candidate: RTCIceCandidateInit;
}

interface MediaUpdatePayload {
    socketId: string;
    micOn: boolean;
    camOn: boolean;
}

type PermissionState = "granted" | "denied" | "prompt" | "unknown";

/* =========================
   HOOK
========================= */
export function useMeetRoom() {
    const socket = getSocket() || initSocket();

    // ===== STATE =====
    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [selfFullname, setSelfFullname] = useState<string>("");
    const [isSpeaking, setIsSpeaking] = useState(false);

    // ===== REFS =====
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const iceCandidateBufferRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const mediaRecordRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const speakingRafRef = useRef<number | null>(null);
    const remoteAnalysersRef = useRef<Map<string, { analyser: AnalyserNode; dataArray: Uint8Array<ArrayBuffer> }>>(new Map());
    const remoteSpeakingStateRef = useRef<Map<string, boolean>>(new Map());
    const remoteSpeakingRafRef = useRef<number | null>(null);

    // ===== HELPERS =====
    const getOrCreateEmptyStream = useCallback(() => {
        if (!localStreamRef.current) {
            localStreamRef.current = new MediaStream();
        }
        return localStreamRef.current;
    }, []);

    const checkPermissionState = useCallback(async (type: "audio" | "video"): Promise<PermissionState> => {
        try {
            const name = type === "audio" ? "microphone" : "camera";
            const status = await navigator.permissions.query({ name: name as PermissionName });
            return status.state as PermissionState;
        } catch {
            return "unknown";
        }
    }, []);

    const findOrCreateSender = useCallback((pc: RTCPeerConnection, kind: "audio" | "video"): RTCRtpSender | null => {
        // First: find sender with existing track
        let sender = pc.getSenders().find(s => s.track?.kind === kind);

        // Second: find sender via transceiver (when track was replaced with null)
        if (!sender) {
            const transceiver = pc.getTransceivers().find(
                t => t.sender.track === null && t.receiver.track?.kind === kind
            );
            if (transceiver) {
                sender = transceiver.sender;
            }
        }

        return sender || null;
    }, []);

    // ===== RECORDING =====
    const startRecording = useCallback(() => {
        if (!localStreamRef.current) return;

        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length === 0) {
            console.warn("Cannot start recording: no audio track available.");
            return;
        }

        const audioStream = new MediaStream(audioTracks);

        const recorder = new MediaRecorder(audioStream, {
            mimeType: 'audio/webm'
        })

        recordedChunksRef.current = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        }

        recorder.start();
        mediaRecordRef.current = recorder;

        console.log("Recording started.");
    }, []);

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise<Blob | null>((resolve) => {
            const recorder = mediaRecordRef.current;
            if (!recorder) {
                console.warn("No recording in progress.");
                resolve(null);
                return;
            }

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: 'audio/webm'
                });
                console.log("Recording stopped. Blob size:", blob.size);
                resolve(blob);
            };

            recorder.stop();
            mediaRecordRef.current = null;
        })
    }, []);

    // ===== SPEAKING DETECTION (SELF) =====
    const setupAudioAnalyser = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return;

        if (!audioContextRef.current) {
            const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            audioContextRef.current = new AudioCtx();
        }

        if (!analyserRef.current) {
            const audioContext = audioContextRef.current!;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;
        }

        if (speakingRafRef.current !== null) {
            return;
        }

        const analyser = analyserRef.current!;
        const dataArray: Uint8Array<ArrayBuffer> = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;

        const update = () => {
            analyser.getByteTimeDomainData(dataArray);
            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const v = (dataArray[i] - 128) / 128;
                sumSquares += v * v;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            const speaking = rms > 0.03;
            setIsSpeaking(prev => (prev === speaking ? prev : speaking));

            speakingRafRef.current = requestAnimationFrame(update);
        };

        speakingRafRef.current = requestAnimationFrame(update);
    }, []);

    const teardownAudioAnalyser = useCallback(() => {
        if (speakingRafRef.current !== null) {
            cancelAnimationFrame(speakingRafRef.current);
            speakingRafRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    // ===== SPEAKING DETECTION (REMOTES) =====
    const startRemoteSpeakingLoop = useCallback(() => {
        if (remoteSpeakingRafRef.current !== null) return;

        const update = () => {
            remoteAnalysersRef.current.forEach((entry, socketId) => {
                const { analyser, dataArray } = entry;
                analyser.getByteTimeDomainData(dataArray);

                let sumSquares = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const v = (dataArray[i] - 128) / 128;
                    sumSquares += v * v;
                }
                const rms = Math.sqrt(sumSquares / dataArray.length);
                const speaking = rms > 0.03;

                const prevSpeaking = remoteSpeakingStateRef.current.get(socketId) ?? false;
                if (prevSpeaking !== speaking) {
                    remoteSpeakingStateRef.current.set(socketId, speaking);
                    setParticipants(prev =>
                        prev.map(p =>
                            p.socketId === socketId ? { ...p, isSpeaking: speaking } : p
                        )
                    );
                }
            });

            remoteSpeakingRafRef.current = requestAnimationFrame(update);
        };

        remoteSpeakingRafRef.current = requestAnimationFrame(update);
    }, []);

    const setupRemoteAnalyser = useCallback((peerSocketId: string, stream: MediaStream) => {
        if (remoteAnalysersRef.current.has(peerSocketId)) return;

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return;

        if (!audioContextRef.current) {
            const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            audioContextRef.current = new AudioCtx();
        }

        const audioContext = audioContextRef.current!;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const dataArray: Uint8Array<ArrayBuffer> = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        source.connect(analyser);

        remoteAnalysersRef.current.set(peerSocketId, { analyser, dataArray });
        startRemoteSpeakingLoop();
    }, [startRemoteSpeakingLoop]);

    // ===== PEER CONNECTION =====
    const createPeerConnection = useCallback((peerSocketId: string): RTCPeerConnection => {
        const existing = pcsRef.current.get(peerSocketId);
        if (existing) return existing;

        const pc = new RTCPeerConnection(rtcConfig);
        iceCandidateBufferRef.current.set(peerSocketId, []);

        // Add local tracks
        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
        });

        // Handle incoming tracks
        pc.ontrack = (event) => {
            const stream = event.streams[0] || new MediaStream([event.track]);

            const attachStream = (retries = 0) => {
                const video = document.getElementById(`remote-${peerSocketId}`) as HTMLVideoElement | null;
                if (video) {
                    if (video.srcObject !== stream) {
                        video.srcObject = stream;
                    }
                    return;
                }

                if (retries < 10) {
                    setTimeout(() => attachStream(retries + 1), 100);
                }
            };

            attachStream();

            if (event.track.kind === "audio") {
                setupRemoteAnalyser(peerSocketId, stream);
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc:ice", {
                    to: peerSocketId,
                    candidate: {
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex
                    }
                });
            }
        };

        pcsRef.current.set(peerSocketId, pc);
        return pc;
    }, [socket, setupRemoteAnalyser]);

    const processBufferedCandidates = useCallback(async (peerSocketId: string) => {
        const pc = pcsRef.current.get(peerSocketId);
        const buffer = iceCandidateBufferRef.current.get(peerSocketId) || [];

        if (pc?.remoteDescription) {
            for (const candidate of buffer) {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (err) {
                    console.warn("[WebRTC] Failed to add buffered ICE:", err);
                }
            }
            iceCandidateBufferRef.current.set(peerSocketId, []);
        }
    }, []);

    const createAndSendOffer = useCallback(async (peerSocketId: string) => {
        const pc = createPeerConnection(peerSocketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { to: peerSocketId, offer });
    }, [createPeerConnection, socket]);

    const closePeerConnection = useCallback((socketId: string) => {
        const pc = pcsRef.current.get(socketId);
        if (pc) {
            pc.close();
            pcsRef.current.delete(socketId);
        }
        iceCandidateBufferRef.current.delete(socketId);
    }, []);

    // ===== MEDIA CONTROLS =====
    const requestMedia = useCallback(async (type: "audio" | "video"): Promise<boolean> => {
        try {
            const permState = await checkPermissionState(type);
            if (permState === "denied") {
                setMediaError(
                    `${type === "audio" ? "Microphone" : "Camera"} access is blocked. ` +
                    "Please allow it in browser site settings and reload."
                );
                return false;
            }

            const newStream = await navigator.mediaDevices.getUserMedia({ [type]: true });
            const newTrack = type === "audio"
                ? newStream.getAudioTracks()[0]
                : newStream.getVideoTracks()[0];

            if (!newTrack) return false;

            const stream = getOrCreateEmptyStream();

            // Remove old tracks of same kind
            const oldTracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
            oldTracks.forEach(t => {
                stream.removeTrack(t);
                t.stop();
            });

            stream.addTrack(newTrack);

            // Update video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Update peer connections
            let needsRenegotiation = false;
            pcsRef.current.forEach(pc => {
                const sender = findOrCreateSender(pc, type);
                if (sender) {
                    sender.replaceTrack(newTrack);
                } else {
                    pc.addTrack(newTrack, stream);
                    needsRenegotiation = true;
                }
            });

            // Renegotiate only if we added new tracks
            if (needsRenegotiation) {
                const promises: Promise<void>[] = [];
                pcsRef.current.forEach((pc, peerId) => {
                    if (pc.signalingState === "stable") {
                        promises.push(createAndSendOffer(peerId).catch(console.error));
                    }
                });
                await Promise.all(promises);
            }

            setMediaError(null);
            if (type === "audio") setMicOn(true);
            if (type === "video") setCamOn(true);
            return true;
        } catch (err: any) {
            console.warn(`❌ ${type} error:`, err?.name);
            setMediaError(
                err?.name === "NotAllowedError"
                    ? `${type === "audio" ? "Microphone" : "Camera"} access denied.`
                    : "Could not access media devices."
            );
            return false;
        }
    }, [checkPermissionState, getOrCreateEmptyStream, findOrCreateSender, createAndSendOffer]);

    const toggleMic = useCallback(async () => {
        const audioTracks = localStreamRef.current?.getAudioTracks() || [];

        if (audioTracks.length === 0) {
            const success = await requestMedia("audio");
            if (success) {
                socket.emit("meet:media-update", { roomId, micOn: true, camOn });

                if (!mediaRecordRef.current) {
                    startRecording();
                }
            }
            return;
        }

        // Toggle existing tracks
        audioTracks.forEach(t => { t.enabled = !t.enabled; });
        const nextMicOn = audioTracks.some(t => t.enabled);
        setMicOn(nextMicOn);
        socket.emit("meet:media-update", { roomId, micOn: nextMicOn, camOn });
    }, [requestMedia, socket, roomId, camOn]);

    const toggleCamera = useCallback(async () => {
        const stream = localStreamRef.current;
        const videoTracks = stream?.getVideoTracks() || [];

        if (videoTracks.length === 0) {
            const success = await requestMedia("video");
            if (success) {
                socket.emit("meet:media-update", { roomId, micOn, camOn: true });
            }
            return;
        }

        // Stop and remove video tracks (release device)
        videoTracks.forEach(track => {
            track.stop();
            stream?.removeTrack(track);
        });

        // Replace track with null on all peer connections
        pcsRef.current.forEach(pc => {
            const sender = findOrCreateSender(pc, "video");
            sender?.replaceTrack(null);
        });

        // Update local video element
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream || null;
        }

        setCamOn(false);
        socket.emit("meet:media-update", { roomId, micOn, camOn: false });
    }, [requestMedia, findOrCreateSender, socket, roomId, micOn]);

    // ===== ROOM ACTIONS =====
    const joinRoom = useCallback(async (targetRoomId: string) => {
        if (!targetRoomId) return;

        setRoomId(targetRoomId);
        getOrCreateEmptyStream();
        socket.emit("meet:join", { roomId: targetRoomId });
        setJoined(true);
    }, [socket, getOrCreateEmptyStream]);

    const leaveRoom = useCallback(async () => {
        socket.emit("meet:leave", { roomId });

        const audioBlob = await stopRecording();
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `meeting-audio-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            console.log("Recording downloaded.");
        }
        setJoined(false);

        teardownAudioAnalyser();
        if (remoteSpeakingRafRef.current !== null) {
            cancelAnimationFrame(remoteSpeakingRafRef.current);
            remoteSpeakingRafRef.current = null;
        }
        remoteAnalysersRef.current.clear();
        remoteSpeakingStateRef.current.clear();
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => undefined);
            audioContextRef.current = null;
        }
        analyserRef.current = null;

        // Cleanup
        pcsRef.current.forEach(pc => pc.close());
        pcsRef.current.clear();
        iceCandidateBufferRef.current.clear();

        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;

        setMicOn(false);
        setCamOn(false);
        setParticipants([]);
    }, [socket, roomId, stopRecording, teardownAudioAnalyser]);

    // ===== SOCKET EVENT HANDLERS =====
    useEffect(() => {
        if (!roomId) return;

        const handleParticipants = async (users: Participant[]) => {
            const selfId = socket.id;

            // Extract self info (for fullname display) and remote participants separately
            const self = users.find(u => u.socketId === selfId);
            if (self) {
                setSelfFullname(self.fullname || self.userId);
            }

            const remotes = users.filter(u => u.socketId !== selfId);

            setParticipants(remotes.map(u => ({
                ...u,
                micOn: u.micOn ?? false,
                camOn: u.camOn ?? false,
                isSpeaking: false
            })));

            // Ensure we have a local (possibly empty) stream ready
            getOrCreateEmptyStream();
            // Do NOT send offers here.
            // Existing participants will get `meet:new-user` and send offers to us.
        };

        const handleOffer = async ({ from, offer }: WebRTCOffer) => {
            try {
                getOrCreateEmptyStream();
                let pc = pcsRef.current.get(from);

                // Handle glare (simultaneous offers)
                if (pc && pc.signalingState !== "stable") {
                    if (socket.id && socket.id < from) {
                        console.log("[WebRTC] Glare: ignoring offer (we win)");
                        return;
                    }
                    closePeerConnection(from);
                    pc = undefined;
                }

                if (!pc) {
                    pc = createPeerConnection(from);
                }

                await pc.setRemoteDescription(offer);
                await processBufferedCandidates(from);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("webrtc:answer", { to: from, answer });
            } catch (err) {
                console.error("[WebRTC] Error handling offer:", err);
            }
        };

        const handleAnswer = async ({ from, answer }: WebRTCAnswer) => {
            try {
                const pc = pcsRef.current.get(from);
                if (pc?.signalingState === "have-local-offer") {
                    await pc.setRemoteDescription(answer);
                    await processBufferedCandidates(from);
                }
            } catch (err) {
                console.error("[WebRTC] Error handling answer:", err);
            }
        };

        const handleIce = async ({ from, candidate }: WebRTCIce) => {
            try {
                const pc = pcsRef.current.get(from);
                if (!pc) return;

                if (pc.remoteDescription) {
                    await pc.addIceCandidate(candidate);
                } else {
                    const buffer = iceCandidateBufferRef.current.get(from) || [];
                    buffer.push(candidate);
                    iceCandidateBufferRef.current.set(from, buffer);
                }
            } catch (err) {
                console.warn("[WebRTC] Error adding ICE:", err);
            }
        };

        const handleNewUser = async ({ userId, fullname, socketId: newSocketId }: { userId: string; fullname?: string; socketId: string }) => {
            setParticipants(prev => {
                if (prev.some(p => p.socketId === newSocketId)) return prev;
                return [
                    ...prev,
                    {
                        userId,
                        fullname: fullname || userId,
                        socketId: newSocketId,
                        micOn: false,
                        camOn: false,
                        isSpeaking: false
                    }
                ];
            });

            await new Promise(r => setTimeout(r, 100));
            getOrCreateEmptyStream();
            await createAndSendOffer(newSocketId);
        };

        const handleMediaUpdate = ({ socketId, micOn: remoteMic, camOn: remoteCam }: MediaUpdatePayload) => {
            setParticipants(prev =>
                prev.map(p => p.socketId === socketId ? { ...p, micOn: remoteMic, camOn: remoteCam } : p)
            );
        };

        const handleUserLeft = ({ socketId }: { socketId: string }) => {
            closePeerConnection(socketId);
            setParticipants(prev => prev.filter(p => p.socketId !== socketId));
            remoteAnalysersRef.current.delete(socketId);
            remoteSpeakingStateRef.current.delete(socketId);
        };

        // Register listeners
        socket.on("meet:participants", handleParticipants);
        socket.on("webrtc:offer", handleOffer);
        socket.on("webrtc:answer", handleAnswer);
        socket.on("webrtc:ice", handleIce);
        socket.on("meet:new-user", handleNewUser);
        socket.on("meet:media-update", handleMediaUpdate);
        socket.on("meet:user-left", handleUserLeft);

        return () => {
            socket.off("meet:participants", handleParticipants);
            socket.off("webrtc:offer", handleOffer);
            socket.off("webrtc:answer", handleAnswer);
            socket.off("webrtc:ice", handleIce);
            socket.off("meet:new-user", handleNewUser);
            socket.off("meet:media-update", handleMediaUpdate);
            socket.off("meet:user-left", handleUserLeft);
        };
    }, [
        roomId,
        socket,
        getOrCreateEmptyStream,
        createPeerConnection,
        createAndSendOffer,
        processBufferedCandidates,
        closePeerConnection
    ]);

    // Start/stop speaking detection based on mic state
    useEffect(() => {
        if (micOn && joined && localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
            setupAudioAnalyser();
        } else {
            teardownAudioAnalyser();
        }
    }, [micOn, joined, setupAudioAnalyser, teardownAudioAnalyser]);

    // Set local video when joined
    useEffect(() => {
        if (joined && localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [joined]);

    return {
        // State
        micOn,
        camOn,
        roomId,
        joined,
        participants,
        mediaError,
        selfId: socket.id,
        selfFullname,
        isSpeaking,

        // Refs
        localVideoRef,

        // Actions
        setRoomId,
        clearMediaError: () => setMediaError(null),
        joinRoom,
        leaveRoom,
        toggleMic,
        toggleCamera,
    };
}
