import * as React from 'react';
import { ReactNode, useState, memo, useCallback, Fragment, useEffect } from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationItemsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

const PaginationItems = memo(function PaginationItems({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
}: PaginationItemsProps) {
    const paginationItems = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
        paginationItems.push(
            <PaginationItem key="1">
                <PaginationLink onClick={() => onPageChange(1)} isActive={currentPage === 1}>
                    1
                </PaginationLink>
            </PaginationItem>
        );
        if (startPage > 2) {
            paginationItems.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
    }

    // Add visible page numbers
    for (let page = startPage; page <= endPage; page++) {
        paginationItems.push(
            <PaginationItem key={page}>
                <PaginationLink onClick={() => onPageChange(page)} isActive={currentPage === page}>
                    {page}
                </PaginationLink>
            </PaginationItem>
        );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationItems.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
        paginationItems.push(
            <PaginationItem key={totalPages}>
                <PaginationLink onClick={() => onPageChange(totalPages)} isActive={currentPage === totalPages}>
                    {totalPages}
                </PaginationLink>
            </PaginationItem>
        );
    }

    return <>{paginationItems}</>;
});

export default function PaginatedList<T>(props: {
    items: T[];
    children: (item: T) => ReactNode;
    getKey: (item: T) => string;
    perPage?: number;
    renderContainer?: (children: ReactNode) => ReactNode;
}) {
    const { items, children, getKey, perPage = 10, renderContainer } = props;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when items change
    }, [items, perPage, setCurrentPage]);

    const totalPages = Math.ceil(items.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const currentItems = items.slice(startIndex, endIndex);

    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page);
        },
        [setCurrentPage]
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="fs-saas-starter-paginated-list">
            {renderContainer ? (
                renderContainer(
                    <>
                        {currentItems.map((item) => (
                            <Fragment key={getKey(item)}>{children(item)}</Fragment>
                        ))}
                    </>
                )
            ) : (
                <div>
                    {currentItems.map((item) => (
                        <div key={getKey(item)}>{children(item)}</div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination className="mt-8 justify-end">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        <PaginationItems
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                className={
                                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
