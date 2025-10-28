import React, { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

interface TestHistory {
  date: string;
  total: number;
  listening: number;
  reading: number;
  delta: string; // Ví dụ: "+40" hoặc "-20"
}

type Order = "asc" | "desc";

const TestHistoryTable: React.FC<{ data: TestHistory[] }> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof TestHistory>("date");

  // 🔹 Hàm sắp xếp theo cột
  const handleSort = (property: keyof TestHistory) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // 🔹 Hàm so sánh giá trị (convert cho từng kiểu dữ liệu)
  const comparator = (a: TestHistory, b: TestHistory) => {
    let valueA = a[orderBy];
    let valueB = b[orderBy];

    // Xử lý riêng kiểu ngày
    if (orderBy === "date") {
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    }

    // Xử lý riêng kiểu delta (+40, -20)
    if (orderBy === "delta") {
      valueA = parseInt(a.delta);
      valueB = parseInt(b.delta);
    }

    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  };

  // 🔹 Sắp xếp + phân trang
  const sortedData = [...data].sort(comparator);
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 🔹 Render
  return (
    <Box>
      <Table
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          "& th": { fontWeight: 700, bgcolor: "#f5f3ff" },
        }}
      >
        <TableHead>
          <TableRow>
            {[
              { id: "date", label: "Ngày" },
              { id: "total", label: "Tổng" },
              { id: "listening", label: "Listening" },
              { id: "reading", label: "Reading" },
              { id: "delta", label: "Thay đổi" },
            ].map((col) => (
              <TableCell key={col.id} sortDirection={orderBy === col.id ? order : false}>
                <TableSortLabel
                  active={orderBy === col.id}
                  direction={orderBy === col.id ? order : "asc"}
                  onClick={() => handleSort(col.id as keyof TestHistory)}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedData.map((t, i) => {
            const isPositive = t.delta.startsWith("+");
            return (
              <TableRow
                key={i}
                sx={{
                  "&:hover": { bgcolor: "#f9fafb" },
                  borderBottom: "1px solid #eee",
                }}
              >
                <TableCell>{t.date}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t.total}</TableCell>
                <TableCell>{t.listening}</TableCell>
                <TableCell>{t.reading}</TableCell>
                <TableCell
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: isPositive ? "green" : "red",
                    fontWeight: 500,
                  }}
                >
                  {isPositive ? (
                    <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                  ) : (
                    <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />
                  )}
                  {t.delta}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ✅ Phân trang */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Hàng mỗi trang:"
      />
    </Box>
  );
};

export default TestHistoryTable;
