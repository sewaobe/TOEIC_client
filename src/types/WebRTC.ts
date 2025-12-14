export type RTCSdpType = "offer" | "answer";

export interface WebRTCSessionDescription {
    type: RTCSdpType;
    sdp: string;
}

export interface WebRTCIceCandidate {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
}