import {
    IconButton,
    Popover,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    Chip,
    Tooltip,
} from "@mui/material";
import {
    Add,
    FileUpload,
    Mic,
    Send,
    Close,
    InsertDriveFile,
    CloudUpload,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, DragEvent, useEffect } from "react";
import { ChatType } from "../../../types/Chat";

interface ChatInputBarProps {
    input: string;
    setInput: (v: string) => void;
    onSend: () => void;
    onTypeSelect: (t: ChatType) => void;
    questionTypes: { value: ChatType; label: string }[];
    selectedType: ChatType;
}

export function ChatInputBar({
    input,
    setInput,
    onSend,
    onTypeSelect,
    questionTypes,
    selectedType,
}: ChatInputBarProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    /* ------------------- MENU ------------------- */
    const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) =>
        setAnchorEl(e.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const handleUploadFile = () => {
        document.getElementById("chat-file-input")?.click();
    };

    const handleAction = (action: string) => {
        if (action === "file") handleUploadFile();
        handleCloseMenu();
    };

    const handleFileSelect = (file?: File) => {
        if (file) setSelectedFile(file);
    };

    /* ------------------- DRAG & DROP ------------------- */
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) setSelectedFile(file);
    };

    /* ------------------- INPUT ------------------- */
    const handleChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 100) + "px";
            setExpanded(el.scrollHeight > 60);
        }
    };

    useEffect(() => {
        const el = textareaRef.current;
        if (el && input === "") {
            el.style.height = "auto";
            setExpanded(false);
        }
    }, [input]);


    const menuActions = [
        { icon: <FileUpload />, label: "Upload File", value: "file" },
    ];

    return (
        <>
            {/* Hidden file input */}
            <input
                type="file"
                id="chat-file-input"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <motion.div
                layout
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-t border-blue-100 p-3 bg-white/90 backdrop-blur-md rounded-b-2xl flex flex-col gap-2 transition-all duration-300 ${isDragging ? "ring-2 ring-blue-400 ring-offset-2" : ""
                    }`}
            >
                {/* drag & drop overlay */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-2xl"
                        >
                            <CloudUpload sx={{ fontSize: 48, color: "#2563eb" }} />
                            <p className="text-sm text-blue-700 font-medium mt-2">
                                Drop your file here
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* mode chip → click để đổi type */}
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setOpenTypeDialog(true)}
                    className="absolute -top-7 left-4 bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-medium shadow-sm cursor-pointer hover:bg-blue-200 transition"
                >
                    Mode: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                </motion.div>

                {/* file preview */}
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-md px-3 py-1 text-sm text-slate-700 shadow-sm"
                    >
                        <div className="flex items-center gap-2 truncate max-w-[80%]">
                            <InsertDriveFile sx={{ fontSize: 18, color: "#2563eb" }} />
                            <span className="truncate">{selectedFile.name}</span>
                        </div>
                        <Tooltip title="Remove file">
                            <IconButton
                                size="small"
                                onClick={() => setSelectedFile(null)}
                                sx={{
                                    color: "#64748b",
                                    "&:hover": { color: "#ef4444" },
                                }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </motion.div>
                )}

                {/* main input */}
                <div
                    className={`relative w-full rounded-2xl border bg-white shadow-sm transition-all ${expanded ? "border-blue-400" : "border-slate-300"
                        }`}
                >
                    <div className="flex-1 px-3 pt-2">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleChangeInput}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend();
                                }
                            }}
                            placeholder="Type your message or drop a file here..."
                            rows={1}
                            className="w-full resize-none border-none bg-transparent focus:outline-none text-[0.95rem] text-slate-700 leading-relaxed max-h-[140px]"
                            style={{
                                overflowY: "auto",
                                minHeight: "36px",
                            }}
                        />
                    </div>

                    {/* toolbar */}
                    <div
                        className={`flex items-center gap-2 px-3 pb-2 ${expanded ? "mt-1" : ""
                            }`}
                    >
                        <IconButton
                            onClick={handleOpenMenu}
                            sx={{
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                                "&:hover": { backgroundColor: "#f1f5f9" },
                            }}
                        >
                            <Add sx={{ color: "#475569" }} />
                        </IconButton>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                            <IconButton
                                sx={{
                                    width: 36,
                                    height: 36,
                                    "&:hover": { backgroundColor: "transparent" },
                                }}
                            >
                                <Mic fontSize="small" sx={{ color: "#64748b" }} />
                            </IconButton>
                            <IconButton
                                sx={{
                                    width: 38,
                                    height: 38,
                                    background:
                                        "linear-gradient(to right, #3b82f6, #8b5cf6)",
                                    color: "white",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(to right, #2563eb, #7c3aed)",
                                    },
                                }}
                                onClick={onSend}
                            >
                                <Send fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Popover chỉ còn Upload File */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                disablePortal
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                        width: 200,
                        overflow: "hidden",
                        mt: 1,
                    },
                }}
            >
                <List dense sx={{ py: 0.5 }}>
                    {menuActions.map((action) => (
                        <ListItemButton
                            key={action.value}
                            onClick={() => handleAction(action.value)}
                            sx={{
                                "&:hover": {
                                    background:
                                        "linear-gradient(to right, #eff6ff, #eef2ff)",
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: "#2563eb" }}>
                                {action.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={action.label}
                                primaryTypographyProps={{
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                    color: "#334155",
                                }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </Popover>

            {/* Dialog chọn Practice Type → bật khi click chip Mode */}
            <AnimatePresence>
                {openTypeDialog && (
                    <Dialog
                        open={openTypeDialog}
                        onClose={() => setOpenTypeDialog(false)}
                        fullWidth
                        maxWidth="xs"
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                p: 2,
                                background:
                                    "linear-gradient(to bottom right, #f8fafc, #eef2ff)",
                            },
                        }}
                    >
                        <DialogTitle
                            sx={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "#1e40af",
                                textAlign: "center",
                                pb: 1,
                            }}
                        >
                            Choose what you want to ask the assistant about
                        </DialogTitle>
                        <DialogContent>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-wrap justify-center gap-2 mt-2"
                            >
                                {questionTypes.map((type) => (
                                    <Chip
                                        key={type.value}
                                        label={type.label}
                                        onClick={() => {
                                            onTypeSelect(type.value);
                                            setOpenTypeDialog(false);
                                        }}
                                        clickable
                                        sx={{
                                            fontSize: "0.8rem",
                                            fontWeight: 500,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: "16px",
                                            background:
                                                "linear-gradient(to right, #f0f9ff, #e0e7ff)",
                                            color: "#334155",
                                            border: "1px solid #c7d2fe",
                                            "&:hover": {
                                                background:
                                                    "linear-gradient(to right, #3b82f6, #8b5cf6)",
                                                color: "white",
                                                border: "none",
                                            },
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
}
