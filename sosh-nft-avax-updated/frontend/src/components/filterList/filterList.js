import { memo, useCallback, useEffect, useState } from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import Checkbox from "../formComponents/checkbox";
import { StyledFilters } from "./style";
import PropTypes from "prop-types";

function FilterList({
  data: filterData,
  onSelect,
  multiple = false,
  selected,
}) {
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    if (multiple && typeof selected === "object") {
      if (selected.length) {
        const tempSelectedFilters = filterData.filter((filter) =>
          selected.includes(filter.value)
        );
        setSelectedFilters(tempSelectedFilters);
      }
    } else {
      const tempSelectedFilter = filterData.find(
        (filter) => filter.value === selected
      );
      setSelectedFilters([tempSelectedFilter]);
    }
  }, [multiple, filterData, selected]);

  const checkboxChangeHandler = useCallback(
    (targetItem, value) => {
      const id = targetItem.value;

      let tempSelectedFilters = [...selectedFilters];

      if (value) {
        if (multiple) {
          const itemIndex = tempSelectedFilters.findIndex(
            (item) => item.value === id
          );
          if (itemIndex === -1) {
            tempSelectedFilters = [...tempSelectedFilters, targetItem];
          }
        } else {
          tempSelectedFilters = [targetItem];
        }
      } else {
        if (multiple) {
          tempSelectedFilters = tempSelectedFilters.filter(
            (item) => item.value !== id
          );
        } else {
          tempSelectedFilters = [];
        }
      }

      setSelectedFilters(tempSelectedFilters);
      onSelect &&
        onSelect(multiple ? tempSelectedFilters : tempSelectedFilters[0]);
    },
    [multiple, selectedFilters, onSelect]
  );

  const isItemSelected = useCallback(
    (id) => {
      return (
        selectedFilters.findIndex(
          (selectedItem) => selectedItem?.value === id
        ) !== -1
      );
    },
    [selectedFilters]
  );

  return (
    <StyledFilters>
      <h3 className="list-title">Filter By</h3>

      <ListGroup variant="flush">
        {filterData?.map((filter) => {
          const { label, value } = filter;
          return (
            <ListGroupItem key={value}>
              <Checkbox
                label={label}
                id={value}
                name={value}
                value={isItemSelected(value)}
                onChange={(value) => checkboxChangeHandler(filter, value)}
              />
            </ListGroupItem>
          );
        })}
      </ListGroup>
    </StyledFilters>
  );
}

export default memo(FilterList);

FilterList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ labe: PropTypes.string, value: PropTypes.string })
  ).isRequired,
  multiple: PropTypes.bool,
  selected: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};
