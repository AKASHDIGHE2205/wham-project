// /* eslint-disable @typescript-eslint/no-explicit-any */
// export const formatDate = (dateString: Date | any) => {
//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   let month: any = date.getMonth() + 1;
//   let day: any = date.getDate();
//   if (month < 10) {
//     month = '0' + month;
//   }
//   if (day < 10) {
//     day = '0' + day;
//   }
//   // return `${day}-${month}-${year}`;
//   return `${year}-${month}-${day}`;
// };

// helper/DateFormate.ts
export const formatDate = (date: Date, format: 'date' | 'datetime' = 'date'): string => {
  if (format === 'datetime') {
    // Use local date components instead of ISO string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Default date format (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};