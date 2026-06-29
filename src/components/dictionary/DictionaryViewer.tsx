import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Divider,
    Avatar,
    ImageList,
    ImageListItem,
    Stack,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ImageIcon from "@mui/icons-material/Image";
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

    const posLabel = (partOfSpeech?: string) => {
        switch (partOfSpeech) {
            case "N":
                return "Danh từ";
            case "V":
                return "Động từ";
            case "Adj":
                return "Tính từ";
            case "Adv":
                return "Trạng từ";
            case "Prep":
                return "Giới từ";
            case "Conj":
                return "Liên từ";
            case "Pron":
                return "Đại từ";
            case "Det":
                return "Mạo từ";
            case "Interj":
                return "Thán từ";
            default:
                return "Khác";
        }
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
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                                {dict.phonetic_uk && (
                                    <Chip size="small" label={`UK ${dict.phonetic_uk}`} variant="outlined" />
                                )}
                                {dict.phonetic_us && (
                                    <Chip size="small" label={`US ${dict.phonetic_us}`} variant="outlined" />
                                )}
                            </Stack>
                        </Box>
                    </Box>

                    {/* Audio */}
                    <Box className="flex gap-2 flex-wrap">
                        {[
                            { label: "UK", audio: dict.audio_uk },
                            { label: "US", audio: dict.audio_us },
                        ].filter((p) => p.audio).map((p) => (
                            <Chip
                                key={p.label}
                                label={p.label}
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
                            {/* POS */}
                            <Box className="flex items-center gap-2 justify-between">
                                <Box className="flex items-center gap-2">
                                    <Chip
                                        label={tran.partOfSpeech || "—"}
                                        color="primary"
                                        size="small"
                                        className="!font-semibold"
                                    />
                                    <Typography variant="subtitle1" className="!font-semibold">
                                        Nghĩa ({posLabel(tran.partOfSpeech)})
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Definitions */}
                            <Box className="flex flex-col gap-2">
                                {tran.meanings?.map((def, defIdx) => (
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
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Examples */}
            {dict.examples && dict.examples.length > 0 && (
                <Card elevation={0} className="border border-slate-100 rounded-2xl !overflow-hidden">
                    <CardContent className="flex flex-col gap-3">
                        <Typography variant="subtitle1" className="!font-semibold">
                            Ví dụ TOEIC
                        </Typography>
                        {dict.examples.map((ex, exIdx) => (
                            <Box key={exIdx} className="border border-slate-100 rounded-xl px-3 py-2 bg-white">
                                <Typography variant="body2" className="!text-slate-900">
                                    {ex.en}
                                </Typography>
                                <Typography variant="body2" className="!text-slate-500">
                                    {ex.vi}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Collocations */}
            {dict.collocations && dict.collocations.length > 0 && (
                <Card elevation={0} className="border border-slate-100 rounded-2xl !overflow-hidden">
                    <CardContent className="flex flex-col gap-3">
                        <Typography variant="subtitle1" className="!font-semibold">
                            Cụm từ thường gặp
                        </Typography>
                        <Box className="flex flex-col gap-2">
                            {dict.collocations.map((item) => (
                                <Box key={item.phrase} className="bg-blue-50/60 rounded-xl px-3 py-2">
                                    <Typography variant="body2" className="!font-semibold !text-slate-900">
                                        {item.phrase}
                                    </Typography>
                                    <Typography variant="body2" className="!text-slate-500">
                                        {item.meaning}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Related words */}
            {((dict.synonyms && dict.synonyms.length > 0) ||
                (dict.antonyms && dict.antonyms.length > 0) ||
                (dict.word_family && dict.word_family.length > 0)) && (
                    <Card elevation={0} className="border border-slate-100 rounded-2xl !overflow-hidden">
                        <CardContent className="flex flex-col gap-4">
                            <Typography variant="subtitle1" className="!font-semibold">
                                Từ liên quan
                            </Typography>

                            {dict.synonyms && dict.synonyms.length > 0 && (
                                <Box className="flex flex-col gap-1">
                                    <Typography variant="caption" className="!uppercase !text-slate-400">
                                        Đồng nghĩa
                                    </Typography>
                                    <Box className="flex gap-1 flex-wrap">
                                        {dict.synonyms.map((item) => (
                                            <Chip
                                                key={item.word}
                                                label={`${item.word} - ${item.meaning}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {dict.antonyms && dict.antonyms.length > 0 && (
                                <Box className="flex flex-col gap-1">
                                    <Typography variant="caption" className="!uppercase !text-slate-400">
                                        Trái nghĩa
                                    </Typography>
                                    <Box className="flex gap-1 flex-wrap">
                                        {dict.antonyms.map((item) => (
                                            <Chip
                                                key={item.word}
                                                label={`${item.word} - ${item.meaning}`}
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {dict.word_family && dict.word_family.length > 0 && (
                                <Box className="flex flex-col gap-1">
                                    <Typography variant="caption" className="!uppercase !text-slate-400">
                                        Họ từ
                                    </Typography>
                                    <Box className="flex gap-1 flex-wrap">
                                        {dict.word_family.map((item) => (
                                            <Chip
                                                key={`${item.word}-${item.partOfSpeech}`}
                                                label={`${item.word} (${item.partOfSpeech})`}
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}

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
