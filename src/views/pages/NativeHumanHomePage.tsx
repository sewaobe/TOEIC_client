import NativeHumanLayout from "../layouts/NativeHumanLayout";
import MeetRoomPage from "./MeetRoomPage";

export default function NativeHumanHomePage() {
    // The MeetRoomPage already handles listing incoming student requests for native humans.
    // Render it directly inside the native layout.
    return (
        <NativeHumanLayout>
            <MeetRoomPage isNativeHuman />
        </NativeHumanLayout>
    );
}
