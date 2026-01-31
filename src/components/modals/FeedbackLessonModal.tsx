
import { Check, ChevronRight, Star, X } from "@mui/icons-material";
import { FC, useEffect, useState } from "react";

// Lý do cho đánh giá thấp/trung bình (1-3 sao)
const REASONS_NEGATIVE = [
    "Quá khó",
    "Quá dễ",
    "Tốc độ quá nhanh",
    "Giải thích khó hiểu",
    "Nội dung nhàm chán",
    "Lỗi kỹ thuật",
    "Khác"
];

// Lý do cho đánh giá cao (4-5 sao)
const REASONS_POSITIVE = [
    "Nội dung thực tế",
    "Giải thích chi tiết",
    "Đúng trình độ",
    "Chủ đề thú vị",
    "Thời lượng hợp lý",
    "Dễ ghi nhớ",
    "Khác"
];

interface FeedbackLessonModalProps {
    open: boolean;
    onClose: () => void;
}

export const FeedbackLessonModal: FC<FeedbackLessonModalProps> = ({
    open = false,
    onClose
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [rating, setRating] = useState(0);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [entered, setEntered] = useState(false);

    const isPositiveRating = rating >= 4;
    const currentReasons = isPositiveRating ? REASONS_POSITIVE : REASONS_NEGATIVE;

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
        setSelectedReasons([]); // Reset reasons when rating changes
    };

    const toggleReason = (reason: string) => {
        setSelectedReasons(prev => {
            if (prev.includes(reason)) {
                return prev.filter(r => r !== reason);
            }
            return [...prev, reason];
        });
    };

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Send feedback to backend
        console.log({
            rating,
            reasons: selectedReasons,
            comment,
            timestamp: new Date().toISOString()
        });

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Auto close after 3 seconds on success
        setTimeout(() => {
            onClose();
            // Reset state
            setTimeout(() => {
                setRating(0);
                setSelectedReasons([]);
                setComment("");
                setIsSubmitted(false);
            }, 300);
        }, 3000);
    };

    const handleClose = () => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
            setRating(0);
            setSelectedReasons([]);
            setComment("");
            setIsSubmitted(false);
        }, 300);
    };

    useEffect(() => {
        let enterTimer: any;
        if (open) {
            // small delay so transition runs after mount
            setEntered(false);
            enterTimer = setTimeout(() => setEntered(true), 50);
        } else {
            setEntered(false);
        }

        return () => clearTimeout(enterTimer);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center px-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300">
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl overflow-hidden relative flex flex-col max-h-[90vh] transition-transform duration-500 ease-out ${entered ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}
            >

                {/* Header - Minimalist & Direct */}
                {!isSubmitted && (
                    <div className="pt-6 px-6 pb-2 text-center">
                        <h2 className="text-xl font-bold text-gray-900">Đánh giá buổi học hôm nay</h2>
                        <p className="text-sm text-gray-500 mt-1">Giúp hệ thống gợi ý bài học phù hợp hơn với bạn</p>
                    </div>
                )}

                {/* Close Button (Top right) */}
                {!isSubmitted && (
                    <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                        <X fontSize="small" />
                    </button>
                )}

                <div className="p-4 sm:p-6 overflow-y-auto transition-all duration-300 ease-in-out">
                    {!isSubmitted ? (
                        <div className="flex flex-col">

                            {/* 1. Rating (Always Visible) */}
                            <div className="flex flex-col items-center z-10 bg-white">
                                <div className="flex gap-2 sm:gap-3 md:gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                            className="transition-transform active:scale-95 focus:outline-none group"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => handleRatingChange(star)}
                                        >
                                            <Star
                                                className={`${star <= (hoverRating || rating)
                                                    ? 'text-yellow-400 drop-shadow-sm'
                                                    : 'text-gray-300'
                                                    } !text-2xl sm:!text-3xl md:!text-4xl transition-colors duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {/* Rating Label with fixed height to prevent jumping but fade in/out */}
                                <div className="h-6 mt-2 flex items-center justify-center">
                                    {(hoverRating > 0 || rating > 0) && (
                                        <span className={`text-sm font-semibold px-3 py-0.5 rounded-full animate-pop-in ${(hoverRating || rating) >= 4 ? 'text-green-600 bg-green-50' : 'text-indigo-600 bg-indigo-50'
                                            }`}>
                                            {(hoverRating || rating) === 5 ? "Tuyệt vời!" :
                                                (hoverRating || rating) === 4 ? "Hài lòng" :
                                                    (hoverRating || rating) === 3 ? "Bình thường" :
                                                        (hoverRating || rating) === 2 ? "Cần cải thiện" : "Không tốt"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progressive Disclosure Section (Reasons + Comment) */}
                            {/* This section is hidden (height=0, opacity=0) until rating > 0 */}
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${rating > 0 ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="pt-4 space-y-6">

                                    {/* 2. Dynamic Reasons (Chips) */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                                            {isPositiveRating
                                                ? <span>Điều gì làm bạn <span className="text-green-600">ấn tượng</span>?</span>
                                                : <span>Vấn đề bạn gặp phải?</span>
                                            }
                                            <span className="text-gray-300 font-normal lowercase ml-1">(có thể chọn nhiều ý)</span>
                                        </label>

                                        <div className="flex flex-wrap gap-2">
                                            {currentReasons.map((reason) => {
                                                const isSelected = selectedReasons.includes(reason);
                                                return (
                                                    <button
                                                        key={reason}
                                                        onClick={() => toggleReason(reason)}
                                                        className={`
                                                            px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                                                            ${isSelected
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                                        `}
                                                    >
                                                        {reason}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 3. Comment (Textarea) */}
                                    <div>
                                        <div className="relative">
                                            <textarea
                                                className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all resize-none outline-none text-gray-800 placeholder-gray-400"
                                                rows={3}
                                                placeholder={isPositiveRating ? "Bạn tâm đắc nhất điều gì?" : "Chúng mình có thể làm gì tốt hơn?"}
                                                value={comment}
                                                maxLength={200}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{comment.length}/200</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-4">
                                <button
                                    onClick={handleClose}
                                    className="py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                                >
                                    Bỏ qua
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                    className={`
                                        py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-100 text-sm
                                        flex items-center justify-center gap-2 transition-all
                                        ${isSubmitting || rating === 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}
                                    `}
                                >
                                    {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                                </button>
                            </div>

                        </div>
                    ) : (
                        /* SUCCESS VIEW */
                        <div className="flex flex-col items-center justify-center py-4 text-center animate-pop-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm">
                                <Check fontSize="large" strokeWidth={3} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cảm ơn bạn!</h3>

                            {/* Response Bubble */}
                            <div className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100 mb-6 relative">
                                {/* Triangle for speech bubble effect */}
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-50 border-t border-l border-indigo-100 rotate-45"></div>

                                <div className="flex flex-col items-center">
                                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1 tracking-wider">Ý kiến của bạn đã được ghi nhận</p>
                                    <p className="text-gray-800 text-sm font-medium leading-relaxed italic">
                                        "Mỗi phản hồi của bạn giúp lộ trình ngày mai phù hợp hơn.”"
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 group"
                            >
                                Tiếp tục học <ChevronRight fontSize="small" className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}