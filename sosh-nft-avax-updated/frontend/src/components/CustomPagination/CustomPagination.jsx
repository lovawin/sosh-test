import React from "react";
import Pagination from "react-bootstrap/Pagination";

const CustomPagination = ({ total, limit, page, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  const displayedPages = 4;

  const renderPaginationItems = () => {
    let items = [];

    items.push(
      <Pagination.Item
        key={1}
        active={page === 1}
        onClick={() => onPageChange(1)}
      >
        {1}
      </Pagination.Item>
    );

    if (page > displayedPages) {
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
    }

    for (
      let i = Math.max(2, page - displayedPages);
      i <= Math.min(totalPages - 1, page + displayedPages);
      i++
    ) {
      items.push(
        <Pagination.Item
          key={i}
          active={page === i}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (page + displayedPages < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis2" />);
    }

    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={page === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <Pagination className="custom-pagination">
      <Pagination.Prev
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      />
      {renderPaginationItems()}
      <Pagination.Next
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      />
    </Pagination>
  );
};

export default CustomPagination;
