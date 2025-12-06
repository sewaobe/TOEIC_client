import { useState } from 'react';
import { SessionResult } from '../types/PracticeSpeaking';

const PAGE_SIZE = 5;

export const useHistoryViewModel = (results: SessionResult[]) => {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(results.length / PAGE_SIZE);
    const isLoading = false;

    // Pagination logic
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    // Reverse the array first to show newest first, then slice
    const displayedResults = results.slice().reverse().slice(startIndex, endIndex);

    return {
        page,
        setPage,
        totalPages,
        displayedResults,
        isLoading,
    };
};