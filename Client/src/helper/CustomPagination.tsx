interface PaginationProps {
  currentPage: number;
  itemPerPage: number;
  totalItems: number;
  handlePageChange: (pageNumber: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({ currentPage, itemPerPage, totalItems, handlePageChange }) => {
  const totalPages = Math.ceil(totalItems / itemPerPage);

  const firstItem = totalItems > 0 ? (currentPage - 1) * itemPerPage + 1 : 0;
  const lastItem = Math.min(currentPage * itemPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-full flex justify-end">
        <div className="text-xs text-slate-950 flex items-center">
          Showing <span className="mx-1 font-medium">{firstItem}</span> to{" "}
          <span className="mx-1 font-medium">{lastItem}</span> of{" "}
          <span className="mx-1 font-medium">{totalItems}</span>{" "}
          {totalItems === 1 ? "item" : "items"}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          &lt;
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 border border-slate-200 rounded-md text-sm ${currentPage === page
              ? "bg-[#4531ff] text-white border-[#4531ff]": "hover:bg-slate-50"}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
export default CustomPagination;