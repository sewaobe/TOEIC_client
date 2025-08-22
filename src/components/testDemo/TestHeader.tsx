import { FC } from "react";
import { Button } from "@mui/material";

const TestHeader: FC = () => {
  return (
    <header className="w-full bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Logo / Tiêu đề */}
      <h1 className="text-xl font-bold text-primary">TOEIC Online Test</h1>

      {/* Thông tin cơ bản */}
      <div className="flex items-center gap-6">
        <span className="text-gray-700 font-medium">Câu đã làm: 10/200</span>
        <span className="text-gray-700 font-medium">Thời gian: 01:55:32</span>
        <Button
          variant="contained"
          color="secondary"
          className="rounded-lg px-4 py-2 font-semibold"
        >
          Nộp bài
        </Button>
      </div>
    </header>
  );
};

export default TestHeader;
