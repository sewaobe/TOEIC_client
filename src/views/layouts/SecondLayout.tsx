// SecondLayout.tsx
import { Box } from "@mui/material";
import { FC, ReactNode } from "react";
import UserExamCard from "../../components/tests/UserExamCard";

interface SecondLayoutProps {
    children: ReactNode;
}

export const SecondLayout: FC<SecondLayoutProps> = ({ children }) => {
    return (
        <Box className="w-full px-8 py-6">
            {/* container có max width để UI không dạt ra quá rộng */}
            <div className="mx-auto max-w-screen-2xl">
                {/* responsive: dọc trên mobile, 2 cột trên md+ */}
                <div className="flex flex-col-reverse gap-6 md:flex-row md:items-start">
                    {/* Cột trái: chiếm phần còn lại, KHÔNG dùng w-full; thêm min-w-0 để tránh tràn */}
                    <div className="basis-full md:basis-[75%] min-w-0">
                        {children}
                    </div>

                    {/* Cột phải: chiều rộng cố định, không cho co lại */}
                    <div className="basis-full md:basis-[25%] shrink-0">
                        <UserExamCard
                            userId="22110285"
                            examDate="30/08/2025"
                            daysLeft={2}
                            targetScore={700}
                            onEditDate={() => console.log("Edit date")}
                            onViewStats={() => console.log("View stats")}
                        />
                    </div>
                </div>
            </div>
        </Box>
    );
};
