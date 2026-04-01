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

export interface PartIntroData {
  part: number;
  termDesc: string; // HTML content
  audioUrl?: string;
}

export const partIntros: PartIntroData[] = [
  {
    part: 1,
    termDesc: `
      <div ng-bind-html="ctrlFunc.htmlDecode(ctrlVar.currentPart.term_desc)" class="ng-binding"><p style="text-align: center;">LISTENING TEST</p><br>In the Listening test, you will be asked to demonstrate how well you understand spoken English. The entire Listening test will last approximately 45 minutes. There are four parts, and directions are given for each part. You must mark your answers on the separate answer sheet. Do not write your answers in your test book.<br><br>PART 1:<br>Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture. Then find the number of the question on your answer sheet and mark your answer. The statements will not be printed in your test book and will be spoken only one time.<br><br><img class="aligncenter wp-image-15871 size-full" src="https://zenlishtoeic.vn/wp-content/uploads/2022/08/4.jpg" alt="" width="1728" height="1188"><br><br>Statement (C), “They’re sitting at a table,” is the bust description of the picture, so you should select answer (C) and mark it on your answer sheet.</div>
    `,
    audioUrl:
      'https://zenlishtoeic.vn/wp-content/uploads/2022/08/DIRECTION-PART-1.mp3',
  },
  {
    part: 2,
    termDesc: `
      <div ng-bind-html="ctrlFunc.htmlDecode(ctrlVar.currentPart.term_desc)" class="ng-binding">PART 2:<br><br>Direction: You will hear a question or statement and three responses spoken in English. They will not be printed in your text book and will be spoken only one time. Select the best response to the question or statement and mark the letter (A), (B) or (C) on your answer sheet.</div>
    `,
    audioUrl:
      'https://zenlishtoeic.vn/wp-content/uploads/2022/08/DIRECTION-PART-2.mp3',
  },
  {
    part: 3,
    termDesc: `
      <div ng-bind-html="ctrlFunc.htmlDecode(ctrlVar.currentPart.term_desc)" class="ng-binding">PART 3: LISTENING<br><br>Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The conversations will not be printed in your test book and will be spoken only one time.</div>
    `,
    audioUrl:
      'https://zenlishtoeic.vn/wp-content/uploads/2022/08/DIRECTION-PART-3.mp3',
  },
  {
    part: 4,
    termDesc: `
     <div ng-bind-html="ctrlFunc.htmlDecode(ctrlVar.currentPart.term_desc)" class="ng-binding">PART 4<br><br>Directions: You will hear some talks given by a single speaker. You will be asked to answer three<br>questions about what the speaker says in each talk. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The talks will not be printed in your test book and will be spoken only one time.</div>
    `,
    audioUrl:
      'https://zenlishtoeic.vn/wp-content/uploads/2022/08/DIRECTION-PART-4.mp3',
  },
  {
    part: 5,
    termDesc: `
      <p><strong>Part 5</strong>: Incomplete Sentences</p>
      <p>You will read a sentence with a missing word or phrase and choose the best option to complete it.</p>
    `,
  },
  {
    part: 6,
    termDesc: `
      <p><strong>Part 6</strong>: Text Completion</p>
      <p>You will read a passage with missing sentences. Choose the best option to complete the passage.</p>
    `,
  },
  {
    part: 7,
    termDesc: `
      <p><strong>Part 7</strong>: Reading Comprehension</p>
      <p>You will read passages and answer questions about them.</p>
    `,
  },
];
