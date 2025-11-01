import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Chip,
    Divider,
    Avatar,
    Tooltip,
    ImageList,
    ImageListItem,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TranslateIcon from "@mui/icons-material/Translate";
import ImageIcon from "@mui/icons-material/Image";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { DictionaryData } from "../../types/Dictionary";

interface DictionaryViewerProps {
    data: DictionaryData;
}

export default function DictionaryViewer({ data }: DictionaryViewerProps) {
    const dict = data;
    const [selectedPhonetic, setSelectedPhonetic] = useState<string | null>(null);

    const handlePlayAudio = (audioUrl?: string) => {
        if (!audioUrl) return;
        const audio = new Audio(audioUrl);
        audio.play();
        setSelectedPhonetic(audioUrl);
        setTimeout(() => setSelectedPhonetic(null), 2000);
    };

    if (!dict) {
        return (
            <Typography variant="body2" className="text-slate-500 text-center">
                Không có dữ liệu hiển thị.
            </Typography>
        );
    }

    return (
        <Box className="w-full flex flex-col gap-4 md:gap-6">
            {/* Header word */}
            <Card
                elevation={0}
                className="!bg-white/70 !backdrop-blur-sm border border-slate-100 rounded-2xl"
            >
                <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <Box className="flex items-center gap-3">
                        <Avatar
                            sx={{ bgcolor: "#2563eb22", width: 46, height: 46 }}
                            variant="rounded"
                        >
                            <MenuBookIcon color="primary" />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" className="!font-bold !text-slate-900">
                                {dict.englishWord}
                            </Typography>
                            {dict.phonetic && (
                                <Typography
                                    variant="body2"
                                    className="!text-slate-500 !mt-0.5"
                                >
                                    {dict.phonetic}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Phonetics */}
                    <Box className="flex gap-2 flex-wrap">
                        {dict.phonetics?.map((p, idx) => (
                            <Chip
                                key={idx}
                                label={p.text || "IPA"}
                                onClick={() => handlePlayAudio(p.audio)}
                                icon={<VolumeUpIcon fontSize="small" />}
                                variant={selectedPhonetic === p.audio ? "filled" : "outlined"}
                                className="!cursor-pointer"
                                sx={{
                                    borderRadius: "9999px",
                                    ...(selectedPhonetic === p.audio
                                        ? { bgcolor: "primary.main", color: "white" }
                                        : {}),
                                }}
                            />
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Translations */}
            <Box className="flex flex-col gap-4">
                {dict.translations?.map((tran, idx) => (
                    <Card
                        key={idx}
                        elevation={0}
                        className="border border-slate-100 rounded-2xl !overflow-hidden"
                    >
                        <CardContent className="flex flex-col gap-3">
                            {/* POS + actions */}
                            <Box className="flex items-center gap-2 justify-between">
                                <Box className="flex items-center gap-2">
                                    <Chip
                                        label={tran.partOfSpeech || "—"}
                                        color="primary"
                                        size="small"
                                        className="!font-semibold"
                                    />
                                    <Typography variant="subtitle1" className="!font-semibold">
                                        Nghĩa (
                                        {tran.partOfSpeech === "N"
                                            ? "Danh từ"
                                            : tran.partOfSpeech === "V"
                                                ? "Động từ"
                                                : tran.partOfSpeech === "Adj"
                                                    ? "Tính từ"
                                                    : tran.partOfSpeech === "Adv"
                                                        ? "Trạng từ"
                                                        : "Khác"}
                                        )
                                    </Typography>
                                </Box>
                                <Box className="flex gap-1">
                                    <Tooltip title="Dịch song ngữ">
                                        <IconButton size="small">
                                            <TranslateIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xem dạng JSON">
                                        <IconButton size="small">
                                            <DataObjectIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Definitions */}
                            <Box className="flex flex-col gap-2">
                                {tran.translatedDefinitions?.map((def, defIdx) => (
                                    <Box
                                        key={defIdx}
                                        className="flex gap-2 items-start bg-slate-50/50 rounded-xl px-3 py-2"
                                    >
                                        <span className="text-slate-400 text-sm mt-0.5">
                                            {defIdx + 1}.
                                        </span>
                                        <Box className="flex flex-col gap-1">
                                            <Typography variant="body2" className="!text-slate-900">
                                                {def.en}
                                            </Typography>
                                            <Typography variant="body2" className="!text-slate-500">
                                                {def.vi}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Examples */}
                            {tran.examples && tran.examples.length > 0 && (
                                <Box className="flex flex-col gap-2 mt-2">
                                    <Typography
                                        variant="subtitle2"
                                        className="!text-slate-700 !font-semibold"
                                    >
                                        Ví dụ
                                    </Typography>
                                    {tran.examples.map((ex, exIdx) => (
                                        <Box
                                            key={exIdx}
                                            className="border border-slate-100 rounded-xl px-3 py-2 bg-white"
                                        >
                                            <Typography variant="body2" className="!text-slate-900">
                                                {ex.en}
                                            </Typography>
                                            <Typography variant="body2" className="!text-slate-500">
                                                {ex.vi}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Synonyms / Antonyms */}
                            {(tran.synonyms?.length || tran.antonyms?.length) ? (
                                <Box className="flex flex-wrap gap-4 mt-2">
                                    {tran.synonyms && tran.synonyms.length > 0 && (
                                        <Box className="flex flex-col gap-1">
                                            <Typography
                                                variant="caption"
                                                className="!uppercase !text-slate-400"
                                            >
                                                Synonyms
                                            </Typography>
                                            <Box className="flex gap-1 flex-wrap">
                                                {tran.synonyms.map((s) => (
                                                    <Chip
                                                        key={s}
                                                        label={s}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {tran.antonyms && tran.antonyms.length > 0 && (
                                        <Box className="flex flex-col gap-1">
                                            <Typography
                                                variant="caption"
                                                className="!uppercase !text-slate-400"
                                            >
                                                Antonyms
                                            </Typography>
                                            <Box className="flex gap-1 flex-wrap">
                                                {tran.antonyms.map((a) => (
                                                    <Chip
                                                        key={a}
                                                        label={a}
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            ) : null}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Images */}
            {dict.imageUrls && dict.imageUrls.length > 0 && (
                <Card
                    elevation={0}
                    className="border border-slate-100 rounded-2xl !overflow-hidden"
                >
                    <CardContent className="flex flex-col gap-3">
                        <Box className="flex items-center gap-2">
                            <ImageIcon color="primary" />
                            <Typography variant="subtitle1" className="!font-semibold">
                                Ảnh minh họa
                            </Typography>
                        </Box>

                        <ImageList cols={dict.imageUrls.length > 1 ? 2 : 1} gap={12}>
                            {dict.imageUrls.map((url) => (
                                <ImageListItem key={url}>
                                    <img
                                        src={url}
                                        alt={dict.englishWord}
                                        className="rounded-xl object-cover h-40 w-full"
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
