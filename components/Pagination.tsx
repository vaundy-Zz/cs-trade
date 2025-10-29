import clsx from 'clsx';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'rounded-md px-3 py-2 text-sm font-medium transition',
          currentPage === 1
            ? 'cursor-not-allowed bg-slate-700 text-slate-500'
            : 'bg-slate-700 text-white hover:bg-slate-600'
        )}
      >
        Previous
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={clsx(
              'rounded-md px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            )}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'rounded-md px-3 py-2 text-sm font-medium transition',
          currentPage === totalPages
            ? 'cursor-not-allowed bg-slate-700 text-slate-500'
            : 'bg-slate-700 text-white hover:bg-slate-600'
        )}
      >
        Next
      </button>
    </div>
  );
}
