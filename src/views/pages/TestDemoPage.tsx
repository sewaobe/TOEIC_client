import { FC } from "react";
import TestHeader from "../../components/testDemo/TestHeader";
import RightSidebar from "../../components/testDemo/RightSidebar";
import QuestionContent from "../../components/testDemo/QuestionContent";

const TestDemoPage: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header (giả sử cao 64px ~ h-16) */}
      <TestHeader />

      {/* Main layout chiếm toàn bộ phần còn lại */}
      <div className="flex flex-1 max-h-[calc(100vh-100px)]">
        {/* Nội dung chính */}
        <main className="flex-1 p-3 flex">
          <QuestionContent />
        </main>

        {/* Sidebar bên phải */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default TestDemoPage;
