import { useMemo } from "react";
import { useLocation } from "react-router";

function useQuery() {
  const location = useLocation();
  const { search } = location || window.location;

  const searchQuery = useMemo(() => new URLSearchParams(search), [search]);

  return { query: searchQuery, location };
}

export default useQuery;
