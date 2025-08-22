import { FC } from "react";

const QuestionContent: FC = () => {
  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white border rounded-md overflow-hidden shadow-sm">
      {/* Cột trái (ảnh / đoạn văn) */}
      <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-6 flex items-center justify-center">
        <img
          src="https://via.placeholder.com/400x300"
          alt="Reading passage / illustration"
          className="max-w-full max-h-[400px] object-contain"
        />
      </div>

      {/* Cột phải (câu hỏi) */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col gap-6">
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-4">Câu 1</h3>
          <p className="mb-4">What is the main idea of the passage?</p>

          <ul className="space-y-2">
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> A.
                Option 1
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> B.
                Option 2
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> C.
                Option 3
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> D.
                Option 4
              </label>
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-4">Câu 1</h3>
          <p className="mb-4">What is the main idea of the passage?</p>

          <ul className="space-y-2">
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> A.
                Option 1
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> B.
                Option 2
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> C.
                Option 3
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> D.
                Option 4
              </label>
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-4">Câu 1</h3>
          <p className="mb-4">What is the main idea of the passage?</p>

          <ul className="space-y-2">
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> A.
                Option 1
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> B.
                Option 2
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> C.
                Option 3
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q1" className="form-radio" /> D.
                Option 4
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuestionContent;
