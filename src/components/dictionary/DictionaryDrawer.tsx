import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    TextField,
    InputAdornment,
    Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import TranslateIcon from "@mui/icons-material/Translate";
import { motion, AnimatePresence } from "framer-motion";
import DictionaryViewer from "./DictionaryViewer";
import DictionaryIntro from "./DictionaryIntro";
import { DictionaryData } from "../../types/Dictionary";
import { useDebounce } from "../../hooks/useDebounce";
import { dictionaryService } from "../../services/dictionary.service";
import TranslationView from "../translation/TranslationView";

interface DictionaryDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function DictionaryDrawer({ open, onClose }: DictionaryDrawerProps) {
    // 👇 giờ ta có 3 view
    const [view, setView] = useState<"intro" | "lookup" | "translate">("intro");

    // ---- lookup states ----
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [result, setResult] = useState<DictionaryData | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suppressSuggestions, setSuppressSuggestions] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 400);

    /* --- Suggestion API --- */
    useEffect(() => {
        if (!debouncedSearch.trim() || suppressSuggestions || view !== "lookup") {
            // chỉ suggest khi đang ở view lookup
            setSuggestions([]);
            setIsSuggesting(false);
            return;
        }

        const start = Date.now();
        setIsSuggesting(true);

        dictionaryService
            .suggestWords(debouncedSearch)
            .then(setSuggestions)
            .catch(console.error)
            .finally(() => {
                const elapsed = Date.now() - start;
                const delay = Math.max(0, 400 - elapsed);
                setTimeout(() => setIsSuggesting(false), delay);
            });
    }, [debouncedSearch, suppressSuggestions, view]);

    /* --- Search main word --- */
    const handleSearch = async (term?: string) => {
        const q = (term ?? searchTerm).trim();
        if (!q) return;

        setIsSearching(true);
        setResult(null);
        setSuggestions([]);
        setSuppressSuggestions(true);

        try {
            const data = await dictionaryService.lookup(q);
            setResult(data);
        } finally {
            setIsSearching(false);
        }
    };


    const handleEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (view === "lookup") handleSearch();
        }
    };

    const resetToIntro = () => {
        setView("intro");
        setSearchTerm("");
        setResult(null);
        setSuggestions([]);
        setSuppressSuggestions(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="dictionary-drawer"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    className="fixed top-0 right-0 h-full w-[420px] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 border-l border-blue-100 shadow-2xl z-[9999] flex flex-col"
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: "1px solid #bfdbfe",
                            background:
                                "linear-gradient(to right, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                background: "linear-gradient(to right, #2563eb, #7c3aed)",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            Language Assistant
                        </Typography>
                        <IconButton onClick={onClose}>
                            <CloseIcon sx={{ color: "#2563eb" }} />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box className="flex-1 overflow-y-auto px-4 py-5">
                        <AnimatePresence mode="wait">
                            {view === "intro" && (
                                <DictionaryIntro
                                    onStartLookup={() => setView("lookup")}
                                    onStartTranslate={() => setView("translate")}
                                />
                            )}

                            {view === "lookup" && (
                                <motion.div
                                    key="lookup"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-4"
                                >
                                    <Box className="flex items-center justify-between mb-2">
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                            Tra cứu từ vựng
                                        </Typography>
                                        <Box className="flex gap-1">
                                            <Button
                                                size="small"
                                                onClick={() => setView("translate")}
                                                startIcon={<TranslateIcon fontSize="small" />}
                                                className="!text-slate-500 !text-xs hover:!text-slate-700"
                                            >
                                                Dịch đoạn
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={resetToIntro}
                                                className="!text-slate-500 !text-xs hover:!text-slate-700"
                                            >
                                                ← Quay lại
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Search Box */}
                                    <TextField
                                        placeholder="Nhập từ cần tra..."
                                        fullWidth
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSuppressSuggestions(false);
                                        }}
                                        onKeyDown={handleEnter}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {isSuggesting ? (
                                                        <CircularProgress size={20} thickness={5} sx={{ mr: 1 }} />
                                                    ) : (
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleSearch()}
                                                            disabled={isSearching}
                                                        >
                                                            <SearchIcon />
                                                        </IconButton>
                                                    )}
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                                backgroundColor: "white",
                                                fontSize: "0.9rem",
                                            },
                                        }}
                                    />

                                    {/* Suggestions */}
                                    <AnimatePresence>
                                        {!isSearching && suggestions.length > 0 && (
                                            <motion.div
                                                key="suggestions"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.25 }}
                                                className="relative"
                                            >
                                                <Box
                                                    className="absolute w-full z-50 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 overflow-hidden"
                                                    sx={{ maxHeight: 220, overflowY: "auto" }}
                                                >
                                                    {suggestions.map((word, i) => (
                                                        <Button
                                                            key={i}
                                                            fullWidth
                                                            onClick={() => {
                                                                setSearchTerm(word);
                                                                handleSearch(word);
                                                            }}
                                                            className="!justify-start !text-slate-700 !capitalize hover:!bg-blue-50 !py-1.5 !px-3"
                                                            sx={{
                                                                fontSize: "0.9rem",
                                                                textTransform: "none",
                                                                borderBottom:
                                                                    i !== suggestions.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                                                            }}
                                                        >
                                                            <SearchIcon fontSize="small" className="mr-1 text-slate-400" />
                                                            {word}
                                                        </Button>
                                                    ))}
                                                </Box>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Result */}
                                    {isSearching ? (
                                        <Box className="flex flex-col items-center justify-center mt-8 text-slate-500">
                                            <CircularProgress size={26} thickness={4} />
                                            <Typography variant="body2" className="mt-2 text-sm">
                                                Đang tra cứu từ vựng...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        result && (
                                            <Fade in timeout={400}>
                                                <Box className="pt-2">
                                                    <DictionaryViewer data={result} />
                                                </Box>
                                            </Fade>
                                        )
                                    )}
                                </motion.div>
                            )}

                            {view === "translate" && (
                                <TranslationView
                                    onBack={resetToIntro}
                                    onSwitchToLookup={() => setView("lookup")}
                                />
                            )}
                        </AnimatePresence>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
