export function calculatePercentageChange(savedValue: number, newValue: number): number {
  if (savedValue === 0) {
    return newValue > 0 ? 100 : 0;
  }
  return ((newValue - savedValue) / savedValue) * 100;
}

export function manualDataPagination(data: any[], page: number, itemsPerPage: number, identifier = "data") {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let totalAttendees = 0;

  if (identifier === "attendances") data.map((d) => (totalAttendees += d.attendees.length));

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedData = data.slice(startIndex, endIndex);

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    [identifier]: paginatedData,
    total: identifier === "attendances" ? totalAttendees : totalItems,
    last_page: totalPages,
    current_page: page,
    has_next_page: hasNextPage,
    has_prev_page: hasPrevPage,
    next_page: hasNextPage ? page + 1 : null,
    previous_page: hasPrevPage ? page - 1 : null,
  };
}
