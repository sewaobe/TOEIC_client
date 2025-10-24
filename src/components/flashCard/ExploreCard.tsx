import React from "react";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { getIconComponentByName, mapBgToIconColor } from "../../utils/colorMapFromBg";
import { useNavigate } from "react-router-dom";

export interface FlashcardExplore {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    level: string;
    wordCount: number;
    learnerCount: number;
    isNew: boolean;
    userLearned: {
        avatar: string;
        fullname: string;
    }[];
    iconName: string;
    gradient: string;
    bgColor: string;
}

export const ExploreCard: React.FC<{ item: FlashcardExplore }> = ({ item }) => {
    const { IconComponent, bgColor } = getIconComponentByName(item.iconName || "Book");
    const textColor = mapBgToIconColor(bgColor);

    // Tailwind gradient classes
    const gradientClass = item.gradient
        ? `bg-gradient-to-r ${item.gradient}`
        : "bg-gray-50";

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/flash-cards/${item._id}?type=explore`);
        localStorage.setItem("flashcardInfo", JSON.stringify(item));
    };

    return (
        <Box
            className={`rounded-2xl p-4 shadow-customCard flex flex-col justify-between min-h-[180px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${gradientClass}`}
            onClick={handleClick}
            sx={{ cursor: "pointer" }}
        >
            {/* Header: Icon + Title + Chip “Mới” */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {/* Icon tròn */}
                    <div
                        className={`w-11 h-11 flex items-center justify-center rounded-full shadow-sm ${bgColor} ${textColor}`}
                    >
                        <IconComponent fontSize="medium" />
                    </div>

                    {/* Tiêu đề (tooltip khi hover) */}
                    <Tooltip title={item.title} arrow placement="top-start">
                        <Typography
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                color: "text.primary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 200, // Giới hạn chiều rộng
                                cursor: "default",
                            }}
                        >
                            {item.title}
                        </Typography>
                    </Tooltip>
                </div>

                {/* Chip “Mới” */}
                {item.isNew && (
                    <Chip
                        label="Mới"
                        size="small"
                        sx={{
                            bgcolor: "success.main",
                            color: "white",
                            fontWeight: 600,
                            fontSize: 10,
                            borderRadius: "6px",
                            height: 22,
                        }}
                    />
                )}
            </div>

            {/* Mô tả */}
            <Typography
                sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.5,
                    mt: 0.5,
                }}
            >
                {item.description}
            </Typography>

            {/* Thông tin: số từ + người học */}
            <div className="flex items-center justify-between mt-3 text-sm text-gray-700">
                <span>📘 {item.wordCount} từ</span>

                {/* Avatars người học */}
                <div className="flex items-center">
                    {item.userLearned && item.userLearned.length > 0 ? (
                        <>
                            {item.userLearned.slice(0, 5).map((user, i) => (
                                <Tooltip key={i} title={user.fullname} arrow placement="top">
                                    <div
                                        className={`w-7 h-7 rounded-full border-2 border-white overflow-hidden ${i !== 0 ? "-ml-1" : ""
                                            } shadow-sm cursor-pointer`}
                                    >
                                        <img
                                            src={user.avatar || "/default-avatar.png"}
                                            alt={user.fullname}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </Tooltip>
                            ))}
                            {item.learnerCount > 5 && (
                                <span className="ml-2 text-xs text-gray-500">
                                    +{item.learnerCount - 5}
                                </span>
                            )}
                        </>
                    ) : (
                        <span>👥 0 người học</span>
                    )}
                </div>
            </div>
        </Box>
    );
};
