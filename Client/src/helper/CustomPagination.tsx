// /* eslint-disable @typescript-eslint/no-explicit-any */
// // CustomPagination.tsx
// interface PaginationProps {
//   currentPage: number;
//   itemPerPage: number;
//   data: any[];
//   handlePageChange: (pageNumber: number) => void;
// }

// const CustomPagination: React.FC<PaginationProps> = ({
//   currentPage,
//   itemPerPage,
//   data,
//   handlePageChange
// }) => {
//   const totalItems = data?.length || 0;
//   const totalPages = Math.ceil(totalItems / itemPerPage);
//   const firstItem = totalItems > 0 ? (currentPage - 1) * itemPerPage + 1 : 0;
//   const lastItem = Math.min(currentPage * itemPerPage, totalItems);

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 3; // Changed from 5 to 3

//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = startPage + maxVisiblePages - 1;

//     // Adjust if we're at the end
//     if (endPage > totalPages) {
//       endPage = totalPages;
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     // Adjust if we're at the beginning
//     if (startPage < 1) {
//       startPage = 1;
//       endPage = Math.min(totalPages, maxVisiblePages);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   return (
//     <div className="flex flex-col items-center space-y-2">
//       <div className="w-full flex justify-end">
//         <div className="text-xs text-slate-950 flex items-center">
//           Showing <span className="mx-1 font-medium">{firstItem}</span> to{" "}
//           <span className="mx-1 font-medium">{lastItem}</span> of{" "}
//           <span className="mx-1 font-medium">{totalItems}</span>{" "}
//           {totalItems === 1 ? "item" : "items"}
//         </div>
//       </div>

//       <div className="flex items-center space-x-1">
//         {/* Previous Button */}
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-3 py-2 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
//         >
//           &lt;
//         </button>

//         {/* Page Numbers */}
//         {getPageNumbers().map((page) => (
//           <button
//             key={page}
//             onClick={() => handlePageChange(page)}
//             className={`px-3 py-2 border border-slate-200 rounded-md text-sm ${currentPage === page
//               ? "bg-orange-600 text-white border-orange-600"
//               : "hover:bg-slate-50"
//               }`}
//           >
//             {page}
//           </button>
//         ))}

//         {/* Next Button */}
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-3 py-2 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
//         >
//           &gt;
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CustomPagination;

interface PaginationProps {
  currentPage: number;
  itemPerPage: number;
  totalItems: number; // use totalItems from API
  handlePageChange: (pageNumber: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({
  currentPage,
  itemPerPage,
  totalItems,
  handlePageChange
}) => {
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
              ? "bg-orange-600 text-white border-orange-600"
              : "hover:bg-slate-50"
              }`}
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