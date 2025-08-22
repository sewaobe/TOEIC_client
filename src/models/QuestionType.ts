export interface QuestionData {
  id: number; // 1..200
  text: string;
  options: string[]; // ['A. ...','B. ...','C. ...','D. ...']
}

export interface QuestionGroup {
  id: string; // unique group id
  part: number; // 1..7
  passageHtml?: string; // passage (cho Part 6/7)
  imageUrl?: string; // nếu là hình
  audioUrl?: string; // nếu là audio (Part 3/4)
  questionIds: number[]; // ví dụ [151,152,153,154]
}

export const questionGroups: QuestionGroup[] = [
  // Part 1: Mỗi ảnh thường chỉ có 1 câu hỏi
  {
    id: 'p1-q1',
    part: 1,
    imageUrl: '/assets/part1/pic1.jpg',
    audioUrl: '/assets/part1/pic1.mp3',
    questionIds: [1],
  },
  {
    id: 'p1-q2',
    part: 1,
    imageUrl: '/assets/part1/pic2.jpg',
    audioUrl: '/assets/part1/pic2.mp3',
    questionIds: [2],
  },

  // Part 2: Chỉ audio, mỗi câu hỏi một đoạn ngắn
  {
    id: 'p2-q7',
    part: 2,
    audioUrl: '/assets/part2/q7.mp3',
    questionIds: [7],
  },
  {
    id: 'p2-q8',
    part: 2,
    audioUrl: '/assets/part2/q8.mp3',
    questionIds: [8],
  },

  // Part 3: Một đoạn hội thoại, nhiều câu hỏi (thường 3)
  {
    id: 'p3-g1',
    part: 3,
    audioUrl: '/assets/part3/dialog1.mp3',
    questionIds: [32, 33, 34],
  },

  // Part 4: Một bài nói, nhiều câu hỏi (thường 3)
  {
    id: 'p4-g1',
    part: 4,
    audioUrl: '/assets/part4/talk1.mp3',
    questionIds: [71, 72, 73],
  },
  // Ví dụ vài câu đơn lẻ (Part 5) => mỗi group chứa 1 câu
  { id: 'p5-q101', part: 5, questionIds: [101] },
  { id: 'p5-q102', part: 5, questionIds: [102] },

  // Part 6: 1 đoạn văn + 4 câu (151-154)
  {
    id: 'p6-g1',
    part: 6,
    passageHtml: `
      <p><strong>MEMO</strong></p>
      <p>To: All staff<br/>From: HR Department<br/>Subject: Office Renovation</p>
      <p>We will renovate the 3rd floor next week. Please relocate to the 2nd floor during that time...</p>
    `,
    questionIds: [151, 152, 153, 154],
  },
  {
    id: 'p6-g2',
    part: 6,
    passageHtml: `
      <p><strong>MEMO</strong></p>
      <p>To: All staff<br/>From: HR Department<br/>Subject: Office Renovation</p>
      <p>We will renovate the 3rd floor next week. Please relocate to the 2nd floor during that time...</p>
    `,
    questionIds: [155, 156, 157, 158],
  },

  // Có thể thêm các group Part 7 (đoạn đơn/đôi/ba) tương tự...
];

export const questionsById: Record<number, QuestionData> = {
  1: {
    id: 1,
    text: 'What is the woman doing?',
    options: ['A. Cooking', 'B. Reading', 'C. Talking', 'D. Writing'],
  },
  2: {
    id: 2,
    text: 'Where is the man standing?',
    options: [
      'A. In a kitchen',
      'B. In an office',
      'C. At a station',
      'D. In a shop',
    ],
  },
  7: {
    id: 7,
    text: 'What does the woman mean?',
    options: [
      'A. She agrees',
      'B. She disagrees',
      'C. She is uncertain',
      'D. She is busy',
    ],
  },
  8: {
    id: 8,
    text: 'What will the man probably do next?',
    options: [
      'A. Call a friend',
      'B. Take a bus',
      'C. Wait longer',
      'D. Leave soon',
    ],
  },
  32: {
    id: 32,
    text: 'Who most likely are the speakers?',
    options: ['A. Coworkers', 'B. Friends', 'C. Customers', 'D. Students'],
  },
  33: {
    id: 33,
    text: 'What are they discussing?',
    options: ['A. A meeting', 'B. A product', 'C. A schedule', 'D. A report'],
  },
  34: {
    id: 34,
    text: 'What will happen next?',
    options: [
      'A. They will go to lunch',
      'B. They will call a manager',
      'C. They will check the report',
      'D. They will cancel the plan',
    ],
  },
  71: {
    id: 71,
    text: 'What is the announcement mainly about?',
    options: [
      'A. A flight delay',
      'B. A new policy',
      'C. A job opening',
      'D. A store closing',
    ],
  },
  72: {
    id: 72,
    text: 'Who is the intended audience?',
    options: ['A. Passengers', 'B. Employees', 'C. Students', 'D. Customers'],
  },
  73: {
    id: 73,
    text: 'What should listeners do?',
    options: [
      'A. Contact the office',
      'B. Fill out a form',
      'C. Wait in line',
      'D. Visit the counter',
    ],
  },
  101: {
    id: 101,
    text: 'Choose the correct word.',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  102: {
    id: 102,
    text: 'Choose the correct word.',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },

  151: {
    id: 151,
    text: 'Why will staff relocate next week?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  152: {
    id: 152,
    text: 'Where will they move?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  153: {
    id: 153,
    text: 'What is the memo about?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  154: {
    id: 154,
    text: 'When will renovation start?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  155: {
    id: 155,
    text: 'Why will staff relocate next week?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  156: {
    id: 156,
    text: 'Where will they move?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  157: {
    id: 157,
    text: 'What is the memo about?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
  158: {
    id: 158,
    text: 'When will renovation start?',
    options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
  },
};
