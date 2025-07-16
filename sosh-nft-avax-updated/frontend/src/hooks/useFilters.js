import { isEqual } from "lodash";
import useQuery from "./useQuery";
import { useNavigate } from "react-router";
import { createQueryString } from "common/common";

/**
 * a hook for filters with conditional url query mapping
 */

const { useState, useEffect, useCallback, useRef } = require("react");

const useFilters = (filterObject, { disableUrlMapping = false } = {}) => {
  const [filters, setFilters] = useState(filterObject);
  const prevFilters = useRef(filterObject);
  const { query } = useQuery();
  const navigate = useNavigate();
  const [isFilterChanged, setIsFilterChanged] = useState(disableUrlMapping);

  useEffect(() => {
    if (!isEqual(filters, prevFilters.current)) {
      setIsFilterChanged(true);
    }
  }, [filters]);
 const handleFilterChange = useCallback(
   (updatedFilter, filterValue) => {
     let newFilters = { ...filters };

     // Handle object-based filter updates
     if (typeof updatedFilter === "object") {
       newFilters = { ...newFilters, ...updatedFilter };
     } else {
       // Function to clear the opposite filters
       const clearOppositeFilter = (currentFilters, currentFilterKey) => {
         // Determine the keys to clear, including "type" if currentFilterKey is not "sale"
         const keysToClear = [
           "current",
           "upcoming",
           "sold",
           "owner",
           "sale",
         ].filter((key) => key !== currentFilterKey);

         if (currentFilterKey !== "sale") {
           keysToClear.push("type");
         }

         const clearedFilters = keysToClear.reduce((acc, key) => {
           acc[key] = null;
           return acc;
         }, {});

         console.log("clearedFilters", clearedFilters, currentFilters);
         return { ...currentFilters, ...clearedFilters };
       };

       // Handle clearing the opposite filters and updating the current filter
       if (
         ["current", "upcoming", "sold", "owner", "sale"].includes(
           updatedFilter
         )
       ) {
         newFilters = clearOppositeFilter(newFilters, updatedFilter);
       }

       newFilters = { ...newFilters, [updatedFilter]: filterValue };
     }

     // Check if filters have changed
     if (!isEqual(newFilters, filters)) {
       // Update previous filters
       prevFilters.current = filters;

       // Update filters state or navigate if url mapping is enabled
       if (!disableUrlMapping) {
         navigate({
           search: createQueryString(newFilters),
         });
       } else {
         setFilters(newFilters);
       }
     }
   },
   [filters, navigate, disableUrlMapping]
 );


  const handleFilterReset = () => {
    prevFilters.current = filters;
    setFilters(filterObject);
  };

  const handleFilterClear = (filterName) => {
    const newFilters = { ...filters };
    prevFilters.current = filters;
    delete newFilters[filterName];
    setFilters(newFilters);
  };

  const handleFilterClearAll = () => {
    prevFilters.current = filters;
    setFilters({});
  };

  useEffect(() => {
    if (!disableUrlMapping) {
      const newFilters = {};
      const queryNames = Object.keys(filterObject);
      queryNames.forEach((queryName) => {
        if (Array.isArray(filterObject[queryName])) {
          newFilters[queryName] = query.getAll(queryName) ?? [];
        } else {
          newFilters[queryName] = query.get(queryName);
        }
      });

      if (!isEqual(newFilters, filters)) {
        prevFilters.current = filters;
        setFilters((prev) => ({
          ...prev,
          ...newFilters,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filterObject]);

  return {
    filters,
    changeFilter: handleFilterChange,
    resetFilters: handleFilterReset,
    clearFilter: handleFilterClear,
    clearAllFilters: handleFilterClearAll,
    isFilterChanged,
  };
};

export default useFilters;
