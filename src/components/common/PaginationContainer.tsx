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
  /** Layout tuỳ chỉnh (tuỳ component cha quyết định) */
  containerSx?: object;
  /** Có hiển thị pagination bar không (một số page có thể muốn ẩn) */
  hidePagination?: boolean;
}

/**
 * PaginationContainer: chỉ xử lý logic phân trang và render.
 * Layout hiển thị item được định nghĩa bởi component cha.
 */
function PaginationContainer<T>({
  items,
  pageCount,
  page,
  onPageChange,
  renderItem,
  containerSx,
  hidePagination = false,
}: PaginationContainerProps<T>) {
  return (
    <Box sx={{ width: '100%', ...containerSx }}>
      {/* Các phần tử hiển thị - cha quyết định kiểu layout */}
      {items.map((item, index) => renderItem(item, index))}

      {/* Thanh phân trang */}
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
