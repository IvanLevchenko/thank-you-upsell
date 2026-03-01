type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePrevious = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <s-stack
      direction="inline"
      paddingBlockEnd="large"
      justifyContent="center"
      gap="small"
    >
      <s-button
        variant="tertiary"
        disabled={!hasPreviousPage}
        onClick={handlePrevious}
      >
        Previous
      </s-button>
      {new Array(totalPages).fill(0).map((_, index) => (
        <s-button
          key={index}
          variant="tertiary"
          disabled={currentPage === index + 1}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </s-button>
      ))}
      <s-button variant="tertiary" disabled={!hasNextPage} onClick={handleNext}>
        Next
      </s-button>
    </s-stack>
  );
}

export default Pagination;
