import React, { useState, useMemo } from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationContainerProps<T> {
  items: T[];
  pageCount: number;
  itemsPerPage?: number;
  page: number; // trang hiện tại từ ngoài
  onPageChange?: (page: number) => void; // callback khi user đổi page
  renderItem: (item: T, index: number) => React.ReactNode;
}

function PaginationContainer<T>({
  items,
  pageCount,
  itemsPerPage = 6,
  page,
  onPageChange,
  renderItem,
}: PaginationContainerProps<T>) {
  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [page, items, itemsPerPage]);

  return (
    <Box className='w-full'>
      <Box className='flex flex-wrap gap-4'>
        {currentItems.map((item, index) => renderItem(item, index))}
      </Box>

      {pageCount > 0 && (
        <Box className='mt-6 flex justify-center'>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => onPageChange?.(p)} // gọi callback bên ngoài
            color='primary'
            shape='rounded'
            siblingCount={0}
          />
        </Box>
      )}
    </Box>
  );
}

export default PaginationContainer;