// src/data/learningMethods.ts

export type MethodDetails = {
  explain: string;    // giải thích dài
  apply: string[];    // các bullet áp dụng TOEIC
};

export type Method = {
  key: string;
  title: string;
  shortDesc: string;  // mô tả ngắn trong thẻ
  details: MethodDetails;
};

export type Group = {
  name: string;
  includes: string;
  methods: Method[];
};

export const LEARNING_METHOD_GROUPS: Group[] = [
  // =========================================================
  // Nhóm 1 — Ghi nhớ & Lặp lại
  // =========================================================
  {
    name: "🧩 Nhóm 1 — Ghi nhớ & Lặp lại",
    includes: "Spaced Repetition, Active Recall, Flashcards, Mnemonics",
    methods: [
      {
        key: "spaced-repetition",
        title: "Spaced Repetition (Ôn cách quãng)",
        shortDesc: "Ôn đúng thời điểm sắp quên để kiến thức “bật lên” và bền lâu.",
        details: {
          explain:
            "Não có đường cong quên lãng: kiến thức giảm dần sau khi học. Spaced Repetition sắp lịch ôn theo khoảng cách tăng dần (1→3→7→14 ngày…) để bạn nhắc lại đúng lúc sắp quên, giúp tiết kiệm thời gian và giữ từ vựng/khái niệm lâu dài.",
          apply: [
            "Vocabulary: xây bộ ~600–1000 từ TOEIC (Travel, Office, Finance…). Mỗi lần ôn đánh dấu lại (Again/Hard/Good/Easy) để hệ thống giãn/thu khoảng cách.",
            "Reading: ôn collocations & cụm chức năng (in accordance with, be responsible for…), các điểm ngữ pháp hay hỏi Part 5 (thì, mạo từ, chủ-vị…).",
          ],
        },
      },
      {
        key: "active-recall",
        title: "Active Recall (Ghi nhớ chủ động)",
        shortDesc: "Buộc não tự truy xuất thông tin thay vì đọc lại thụ động.",
        details: {
          explain:
            "Active Recall yêu cầu bạn tự trả lời/diễn đạt lại từ trí nhớ. Hành vi truy xuất này khắc sâu dấu vết ký ức, giúp nhớ bền hơn so với chỉ đọc lại hoặc gạch chân.",
          apply: [
            "Grammar — Part 5: câu cloze (điền từ) ẩn đáp án; bắt buộc giải thích vì sao chọn.",
            "Reading — Part 6–7: sau khi đọc đoạn, viết tóm ý 1–2 câu rồi mới xem đáp án mẫu để đối chiếu.",
          ],
        },
      },
      {
        key: "flashcards",
        title: "Flashcards (Thẻ học)",
        shortDesc: "Mặt trước hỏi (từ/câu/âm), mặt sau trả lời (nghĩa/giải thích/ảnh).",
        details: {
          explain:
            "Flashcard gom kiến thức ở đơn vị nhỏ (từ, cụm, cấu trúc). Có thể kèm audio/ảnh để gợi nhớ nhanh. Kết hợp Spaced Repetition tạo chu trình ôn tối ưu.",
          apply: [
            "Vocab/Collocations: front = từ/định nghĩa EN; back = nghĩa + ví dụ ngữ cảnh TOEIC.",
            "Listening: thẻ audio (cụm/câu ngắn) — nghe ở mặt trước, mặt sau là transcript + nghĩa.",
            "Grammar: thẻ “câu sai → sửa đúng”, kèm ghi chú quy tắc thường gặp (mạo từ, thì, voice…).",
          ],
        },
      },
      {
        key: "mnemonics",
        title: "Mnemonics (Mẹo ghi nhớ)",
        shortDesc: "Tạo liên tưởng hình ảnh/câu chuyện/vần điệu để neo nghĩa.",
        details: {
          explain:
            "Mnemonics tạo ‘móc’ ghi nhớ: hình ảnh kỳ lạ, câu chuyện vui, hay vần điệu. Hữu ích với từ trừu tượng hoặc cặp từ dễ nhầm.",
          apply: [
            "Cặp dễ nhầm: invoice vs receipt; stationery vs stationary… tạo chuyện/ảnh phân biệt rõ.",
            "Từ ít gặp/khó hình dung: gán biểu tượng/biểu đồ đơn giản để gợi nghĩa nhanh khi ôn.",
          ],
        },
      },
    ],
  },

  // =========================================================
  // Nhóm 2 — Học đa kênh & Hình ảnh hóa
  // =========================================================
  {
    name: "🎨 Nhóm 2 — Học đa kênh & Hình ảnh hóa",
    includes: "Dual Coding, Mind Mapping, Visual Mnemonics",
    methods: [
      {
        key: "dual-coding",
        title: "Dual Coding (Mã hóa kép)",
        shortDesc: "Kết hợp chữ + hình/âm thanh để mở hai đường truy xuất trong não.",
        details: {
          explain:
            "Não xử lý thông tin tốt hơn khi có cả kênh ngôn ngữ (text/audio) và kênh hình ảnh. Dual Coding tạo hai lối vào/kích hoạt, giúp hiểu nhanh và nhớ sâu.",
          apply: [
            "Listening Part 1: ảnh tình huống + audio mô tả — giúp nối từ vựng với bối cảnh trực quan.",
            "Vocabulary: thêm icon/ảnh đại diện cho cụm (departure gate, maintenance crew…) để gợi hình.",
          ],
        },
      },
      {
        key: "mind-mapping",
        title: "Mind Mapping (Sơ đồ tư duy)",
        shortDesc: "Tổ chức kiến thức theo cây nhánh (topic → subtopic) để hệ thống hóa.",
        details: {
          explain:
            "Sơ đồ tư duy hiển thị quan hệ giữa ý chính-ý phụ, giúp bao quát cấu trúc và tìm nhanh điểm còn thiếu. Phù hợp tổng hợp nhiều mẩu kiến thức rời.",
          apply: [
            "Vocab theo chủ đề: Business → Meeting → Agenda/Minutes/Participants → collocations đi kèm.",
            "Reading Part 7: vẽ sơ đồ ý chính – chi tiết – ví dụ cho bài dài để nhớ cấu trúc và ý tóm lược.",
          ],
        },
      },
      {
        key: "visual-mnemonics",
        title: "Visual Mnemonics (Hình hoá ghi nhớ)",
        shortDesc: "Dùng biểu tượng/hình vẽ để tạo ‘neo’ thị giác cho khái niệm/từ vựng.",
        details: {
          explain:
            "Hình ảnh ấn tượng, nhất quán giúp bạn truy xuất nghĩa cực nhanh. Khác với Mnemonics thuần ‘chữ’, Visual Mnemonics ưu tiên kênh thị giác.",
          apply: [
            "Từ khó/ít gặp: gán icon/ảnh minh hoạ, đặt cạnh ví dụ ngắn trong ngữ cảnh công việc.",
            "Thuật ngữ kỹ thuật: vẽ sơ đồ/bước quy trình đơn giản (e.g., shipping → invoice → receipt).",
          ],
        },
      },
    ],
  },

  // =========================================================
  // Nhóm 3 — Luyện tập & Phản hồi
  // =========================================================
  {
    name: "🎧 Nhóm 3 — Luyện tập & Phản hồi",
    includes: "Shadowing, Dictation, Self-testing, Mock Tests",
    methods: [
      {
        key: "shadowing",
        title: "Shadowing (Nghe và nhắc lại)",
        shortDesc: "Nói chồng theo speaker để luyện nhịp điệu, nối âm, trọng âm.",
        details: {
          explain:
            "Shadowing giúp đồng bộ tai-miệng: bạn nghe và lặp lại gần như ngay lập tức. Cải thiện stress pattern, nối âm, tốc độ nói và độ tự tin khi nghe-nói.",
          apply: [
            "Listening Part 3–4: chọn đoạn ở tốc độ phù hợp; bắt đầu có script, sau đó ẩn dần.",
            "Ghi âm lại, so sánh với mẫu để nhận ra chỗ nuốt âm/nhấn sai; cải thiện dần độ trễ và rõ ràng.",
          ],
        },
      },
      {
        key: "dictation",
        title: "Dictation (Nghe – Chép)",
        shortDesc: "Nghe và gõ/điền lại, rèn khả năng nhận diện âm-từ-cụm (bottom-up).",
        details: {
          explain:
            "Dictation ép bạn ‘bắt’ từng âm/từ, xử lý nối âm và chính tả. Tăng nhạy tai với phát âm thực tế, giảm sai sót nghe nhầm từ đồng âm/cận âm.",
          apply: [
            "Part 2 (Hỏi-đáp ngắn): bắt đầu gap-fill một số từ khoá; nâng lên full dictation.",
            "Part 4 (Thông báo): nghe từng đoạn ngắn; kiểm lỗi chính tả, mạo từ, giới từ, đuôi –ed.",
          ],
        },
      },
      {
        key: "self-testing",
        title: "Self-testing (Tự kiểm tra)",
        shortDesc: "Kiểm tra nhanh, nhẹ áp lực để củng cố ngay sau khi học.",
        details: {
          explain:
            "Bài test ngắn ‘đóng chu kỳ’ học: cho biết mình đã nắm gì và hổng gì; tạo phản hồi tức thì, ngăn ảo giác ‘hiểu rồi’.",
          apply: [
            "Vocab/Grammar: quiz 5–10 câu, kèm giải thích ngắn, ví dụ thực tế TOEIC.",
            "Reading: phân loại câu (detail, inference, purpose, vocab-in-context) để nhận diện điểm yếu.",
          ],
        },
      },
      {
        key: "mock-tests",
        title: "Mock Tests (Đề mô phỏng)",
        shortDesc: "Luyện điều kiện thi thật (đồng hồ, số câu, áp lực, quản lý thời gian).",
        details: {
          explain:
            "Mô phỏng sát bài thi giúp quen phân bổ thời gian, áp lực tâm lý và sức bền. Đọc báo cáo sau test để điều chỉnh chiến lược.",
          apply: [
            "Full test 200 câu: luyện chiến lược theo part, đánh dấu câu tốn thời gian bất thường.",
            "Mini-test theo Part: rèn sâu từng mảng (vd. Part 5/6 ngữ pháp, Part 3/4 nghe đoạn dài).",
          ],
        },
      },
    ],
  },

  // =========================================================
  // Nhóm 4 — Chiến lược học thông minh
  // =========================================================
  {
    name: "⏳ Nhóm 4 — Chiến lược học thông minh",
    includes: "Interleaving, Pomodoro, Deliberate Practice",
    methods: [
      {
        key: "interleaving",
        title: "Interleaving (Học đan xen)",
        shortDesc: "Không ‘cắm đầu’ một dạng quá lâu; xen kẽ giúp phân biệt khái niệm.",
        details: {
          explain:
            "Đan xen các dạng nội dung làm não luôn phải chuyển chế độ xử lý, tránh chán và tăng khả năng phân biệt tinh tế giữa khái niệm gần nhau.",
          apply: [
            "Phiên 60′: 15′ Listening → 15′ Vocab → 15′ Reading → 15′ Grammar; đổi thứ tự theo ngày.",
            "Khi ‘đụng trần’ một dạng, chuyển sang dạng khác để giữ độ tươi mới và hiệu quả.",
          ],
        },
      },
      {
        key: "pomodoro",
        title: "Pomodoro (Kỹ thuật quả cà chua)",
        shortDesc: "Học 25′, nghỉ 5′ (hoặc 35′/7′) để duy trì tập trung dài hạn.",
        details: {
          explain:
            "Chia nhỏ thời gian thành block có nghỉ ngắn giúp não phục hồi, giảm mệt mỏi tích luỹ. Theo dõi số pomodoro mỗi tuần để duy trì nhịp độ.",
          apply: [
            "1 Pomodoro Listening Part 1/2 + 1 Pomodoro Vocab SRS; đổi xen kẽ khi mệt.",
            "Dùng đồng hồ đếm ngược; ghi lại số block hoàn thành để đánh giá tiến độ thật.",
          ],
        },
      },
      {
        key: "deliberate-practice",
        title: "Deliberate Practice (Luyện có chủ đích)",
        shortDesc: "Đánh thẳng vào lỗi cụ thể bằng bài tập thiết kế riêng + phản hồi rõ.",
        details: {
          explain:
            "Không ‘làm nhiều cho vui’, mà tập trung vào điểm yếu (ví dụ: thì quá khứ, câu suy luận). Bài tập khó vừa đủ, có ví dụ/giải thích để sửa sai triệt để.",
          apply: [
            "Nếu hay sai inference ở Reading: gói 20–30 câu inference, có giải mẫu so sánh đáp án nhiễu.",
            "Nếu hay sai thì/giới từ: bộ câu cloze theo chủ điểm, kèm note quy tắc + ví dụ tương phản.",
          ],
        },
      },
    ],
  },

  // =========================================================
  // Nhóm 5 — Học xã hội & Công nghệ
  // =========================================================
  {
    name: "👥 Nhóm 5 — Học xã hội & Công nghệ",
    includes: "Peer Learning, Gamification, Adaptive Learning",
    methods: [
      {
        key: "peer-learning",
        title: "Peer Learning (Học cùng bạn bè)",
        shortDesc: "Giải thích/đặt câu hỏi cho nhau để hiểu sâu (teaching-to-learn).",
        details: {
          explain:
            "Khi buộc phải giải thích cho người khác, bạn phát hiện nhanh lỗ hổng hiểu biết và củng cố kiến thức cốt lõi. Thảo luận cũng mở rộng góc nhìn.",
          apply: [
            "Role-play Part 3: chia vai hội thoại (customer–staff); đổi vai để luyện phản xạ.",
            "Reading: tranh luận loại trừ đáp án; giải thích vì sao đáp án kia sai.",
          ],
        },
      },
      {
        key: "gamification",
        title: "Gamification (Trò chơi hoá)",
        shortDesc: "Điểm, huy hiệu, thử thách tuần để duy trì động lực dài hạn.",
        details: {
          explain:
            "Thưởng điểm/huy hiệu, bảng xếp hạng hoặc thử thách nhẹ nhàng giúp tạo thói quen và cảm giác tiến bộ rõ rệt.",
          apply: [
            "Streak 7 ngày mở mini-game vocab; thử thách tuần 100 câu Reading đúng ≥ 70%.",
            "Giai đoạn đầu: mục tiêu nhỏ, phản hồi nhanh; tăng dần độ khó để tránh chán.",
          ],
        },
      },
      {
        key: "adaptive-learning",
        title: "Adaptive Learning (Học thích ứng bằng AI)",
        shortDesc: "Chọn câu/bài ‘vừa sức nhưng có thử thách’ dựa trên kết quả làm bài.",
        details: {
          explain:
            "Hệ thống ước lượng năng lực hiện tại từ lịch sử đúng/sai và thời gian làm bài, rồi chọn câu mang thông tin cao nhất để bạn tiến bộ nhanh.",
          apply: [
            "Reading: nếu yếu inference → tăng tỷ lệ câu inference, xen kẽ các chủ đề để đa dạng ngữ cảnh.",
            "Listening: nếu Part 4 kém → ưu tiên đoạn độc thoại dài, nhiều accent, có theo dõi thời gian.",
          ],
        },
      },
    ],
  },
];
