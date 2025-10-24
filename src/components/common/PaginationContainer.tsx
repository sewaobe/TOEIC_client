import React from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationContainerProps<T> {
  /** Dữ liệu hiển thị trên trang hiện tại */
  items: T[];
  /** Tổng số trang */
  pageCount: number;
  /** Trang hiện tại */
  page: number;
  /** Callback khi đổi trang */
  onPageChange?: (page: number) => void;
  /** Hàm render từng item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Style tùy chỉnh cho phần nội dung */
  contentSx?: object;
  /** Style cho toàn bộ container */
  containerSx?: object;
  /** Ẩn pagination (ví dụ khi chỉ có 1 trang) */
  hidePagination?: boolean;
}

function PaginationContainer<T>({
  items,
  pageCount,
  page,
  onPageChange,
  renderItem,
  containerSx,
  contentSx,
  hidePagination = false,
}: PaginationContainerProps<T>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        justifyContent: 'space-between', // đảm bảo pagination nằm cuối
        ...containerSx,
      }}
    >
      {/* Nội dung (list item, grid, card...) */}
      <Box sx={{ flex: 1, width: '100%', ...contentSx }}>
        {items.length > 0 ? (
          items.map((item, index) => renderItem(item, index))
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            Không có dữ liệu
          </Box>
        )}
      </Box>

      {/* Thanh phân trang ở dưới cùng */}
      {!hidePagination && pageCount > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => onPageChange?.(p)}
            color="primary"
            shape="rounded"
            siblingCount={0}
          />
        </Box>
      )}
    </Box>
  );
}

export default PaginationContainer;
