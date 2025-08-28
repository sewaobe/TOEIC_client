import React, { useState, useMemo } from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationContainerProps<T> {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function PaginationContainer<T>({
  items,
  itemsPerPage = 6,
  renderItem,
}: PaginationContainerProps<T>) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [page, items, itemsPerPage]);

  return (
    <Box className='w-full'>
      <Box className='flex flex-wrap gap-4'>
        {currentItems.map((item, index) => renderItem(item, index))}
      </Box>

      {pageCount > 1 && (
        <Box className='mt-6 flex justify-center'>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
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
