export interface ToeicPart {
    label: string        // Ví dụ: "Part 3 – Hội thoại ngắn (Conversations)"
    description: string  // Mô tả ngắn
    tags: string[]       // Danh sách chủ đề
}

// ===== TOEIC LISTENING =====

// Part 1 – Mô tả tranh (Photographs)
export const part1: ToeicPart = {
    label: "Part 1 – Mô tả tranh (Photographs)",
    description: "Luyện nghe – nhìn để mô tả tranh, tập trung vào hành động, vị trí và đối tượng.",
    tags: ["Tranh tả người", "Tranh tả vật"],
}

// Part 2 – Hỏi đáp ngắn (Question–Response)
export const part2: ToeicPart = {
    label: "Part 2 – Hỏi đáp ngắn (Question–Response)",
    description: "Rèn phản xạ nghe – trả lời tự nhiên trong hội thoại hằng ngày.",
    tags: [
        "Câu hỏi WHAT",
        "Câu hỏi WHO",
        "Câu hỏi WHERE",
        "Câu hỏi WHEN",
        "Câu hỏi HOW",
        "Câu hỏi WHY",
        "Câu hỏi YES/NO",
        "Câu hỏi đuôi",
        "Câu hỏi lựa chọn",
        "Câu yêu cầu, đề nghị",
        "Câu trần thuật",
    ],
}

// Part 3 – Hội thoại ngắn (Conversations)
export const part3: ToeicPart = {
    label: "Part 3 – Hội thoại ngắn (Conversations)",
    description: "Luyện nghe hội thoại nhiều lượt giữa hai hoặc ba người trong bối cảnh công việc.",
    tags: [
        "Câu hỏi về chủ đề, mục đích",
        "Câu hỏi về danh tính người nói",
        "Câu hỏi về chi tiết cuộc hội thoại",
        "Câu hỏi về hành động tương lai",
        "Câu hỏi kết hợp bảng biểu",
        "Câu hỏi về hàm ý câu nói",
        "Chủ đề: Company - General Office Work",
        "Chủ đề: Company - Personnel",
        "Chủ đề: Company - Event, Project",
        "Chủ đề: Company - Facility",
        "Chủ đề: Shopping, Service",
        "Chủ đề: Order, delivery",
        "Chủ đề: Transportation",
        "Câu hỏi về yêu cầu, gợi ý",
    ],
}

// Part 4 – Bài nói ngắn (Talks)
export const part4: ToeicPart = {
    label: "Part 4 – Bài nói ngắn (Talks)",
    description: "Luyện nghe các bài nói ngắn như thông báo, bản tin hoặc phát biểu.",
    tags: [
        "Câu hỏi về chủ đề, mục đích",
        "Câu hỏi về danh tính, địa điểm",
        "Câu hỏi về chi tiết",
        "Câu hỏi về hành động tương lai",
        "Câu hỏi kết hợp bảng biểu",
        "Câu hỏi về hàm ý câu nói",
        "Dạng bài: Telephone message - Tin nhắn thoại",
        "Dạng bài: Announcement - Thông báo",
        "Dạng bài: News report, Broadcast - Bản tin",
        "Dạng bài: Talk - Bài phát biểu, diễn văn",
        "Dạng bài: Excerpt from a meeting - Trích dẫn từ buổi họp",
        "Câu hỏi yêu cầu, gợi ý",
    ],
}

// ===== TOEIC READING =====

// Part 5 – Hoàn thành câu (Incomplete Sentences)
export const part5: ToeicPart = {
    label: "Part 5 – Hoàn thành câu (Incomplete Sentences)",
    description: "Ôn luyện ngữ pháp và từ vựng cơ bản thông qua các câu rời rạc.",
    tags: [
        "Câu hỏi từ loại",
        "Câu hỏi ngữ pháp",
        "Câu hỏi từ vựng",
        "Danh từ",
        "Đại từ",
        "Tính từ",
        "Thì",
        "Trạng từ",
        "Động từ nguyên mẫu có to",
        "Giới từ",
        "Liên từ",
        "Mệnh đề quan hệ",
        "Cấu trúc so sánh",
    ],
}

// Part 6 – Hoàn thành đoạn văn (Text Completion)
export const part6: ToeicPart = {
    label: "Part 6 – Hoàn thành đoạn văn (Text Completion)",
    description: "Rèn khả năng hiểu mạch văn và lựa chọn từ/câu phù hợp với ngữ cảnh.",
    tags: [
        "Danh từ",
        "Tính từ",
        "Thì",
        "Thể",
        "Phân từ và Cấu trúc phân từ",
        "Giới từ",
        "Liên từ",
        "Câu hỏi từ loại",
        "Câu hỏi ngữ pháp",
        "Câu hỏi từ vựng",
        "Câu hỏi điền câu vào đoạn văn",
        "Hình thức: Thư điện tử / Thư tay (Email / Letter)",
        "Hình thức: Thông báo / Văn bản hướng dẫn (Notice / Announcement)",
    ],
}

// Part 7 – Đọc hiểu (Reading Comprehension)
export const part7: ToeicPart = {
    label: "Part 7 – Đọc hiểu (Reading Comprehension)",
    description: "Rèn kỹ năng đọc hiểu, phân tích và suy luận trong các đoạn văn dài.",
    tags: [
        "Câu hỏi tìm thông tin",
        "Câu hỏi tìm chi tiết sai",
        "Câu hỏi về chủ đề, mục đích",
        "Câu hỏi suy luận",
        "Câu hỏi điền câu",
        "Cấu trúc: một đoạn",
        "Cấu trúc: nhiều đoạn",
        "Dạng bài: Email / Letter – Thư điện tử / Thư tay",
        "Dạng bài: Form – Đơn từ / Biểu mẫu",
        "Dạng bài: Article / Review – Bài báo / Bài đánh giá",
        "Dạng bài: Advertisement – Quảng cáo",
        "Dạng bài: Announcement – Thông báo",
        "Dạng bài: Text message chain – Chuỗi tin nhắn",
        "Câu hỏi tìm từ đồng nghĩa",
        "Câu hỏi về hàm ý câu nói",
    ],
}

// ===== Tổng hợp =====
export const toeicPartsArray: ToeicPart[] = [part1, part2, part3, part4, part5, part6, part7]
