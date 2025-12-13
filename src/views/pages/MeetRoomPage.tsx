import { useEffect, useState } from "react";
import { getSocket, initSocket } from "../../services/socket.service";

export default function MeetRoomPage() {
    const [roomId, setRoomId] = useState("");
    const [logs, setLogs] = useState<string[]>([]);
    const [joined, setJoined] = useState(false);

    const socket = getSocket() || initSocket();

    useEffect(() => {

        socket.on("meet:user-joined", ({ userId }) => {
            setLogs((prev) => [...prev, `User ${userId} joined`]);
        });

        socket.on("meet:user-left", ({ userId }) => {
            setLogs((prev) => [...prev, `User ${userId} left`]);
        });

        return () => {
            socket.off("meet:user-joined");
            socket.off("meet:user-left");
        };
    }, []);

    const joinRoom = () => {
        if (!roomId) return;
        socket.emit("meet:join", { roomId });
        setJoined(true);
        setLogs((prev) => [...prev, `You joined room ${roomId}`]);
    };

    const leaveRoom = () => {
        socket.emit("meet:leave", { roomId });
        setJoined(false);
        setLogs((prev) => [...prev, `You left room ${roomId}`]);
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Meet Room (Phase 1)</h2>

            {!joined && (
                <>
                    <input
                        placeholder="Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button onClick={joinRoom}>Join</button>
                </>
            )}

            {joined && <button onClick={leaveRoom}>Leave</button>}

            <ul>
                {logs.map((log, i) => (
                    <li key={i}>{log}</li>
                ))}
            </ul>
        </div>
    );
}
