import { useCallback, useState } from "react";
import { isEqual } from "lodash";

const defaultData = {
  page: 1,
  limit: 12,
  total: 0,
};

const usePagination = (initialData = null) => {
  const [page, setPage] = useState(initialData?.page ?? defaultData.page);
  const [limit, setLimit] = useState(initialData?.limit ?? defaultData.limit);
  const [total, setTotal] = useState(initialData?.total ?? defaultData.total);

  const updatePage = useCallback(
    (_page) => {
      if (page !== _page) {
        setPage(_page);
      }
    },
    [page]
  );

  const updateLimit = useCallback(
    (_limit) => {
      if (limit !== _limit) {
        setLimit(_limit);
      }
    },
    [limit]
  );

  const updateTotal = useCallback(
    (_total) => {
      if (total !== _total) {
        setTotal(_total);
      }
    },
    [total]
  );

  const setData = useCallback(
    (data) => {
      if (!isEqual(data, { page, limit, total })) {
        setPage(data.page);
        setLimit(data.limit);
        setTotal(data.total);
      }
    },
    [page, limit, total]
  );

  const resetData = useCallback(() => {
    setData(initialData);
  }, [setData, initialData]);

  return {
    page,
    limit,
    total,
    setPage: updatePage,
    setLimit: updateLimit,
    setTotal: updateTotal,
    setData: setData,
    resetData,
  };
};

export default usePagination;
