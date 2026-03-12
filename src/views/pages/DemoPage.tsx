import { useState } from "react";
import CertificatePage, { ToeicCertificateData } from "./CertificatePage";

export default function DemoPage() {
    const [open, setOpen] = useState(true);
    

    return <CertificatePage />
}