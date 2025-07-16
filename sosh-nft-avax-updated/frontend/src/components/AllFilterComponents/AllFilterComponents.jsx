import React, { useState } from "react";
import { StyledAllFilterComponents } from "./style";
import TabSwitcher from "TabSwitcher/TabSwitcher";
import FilterIconSecond from "../../assets/icons/filterIconSecond";
import Dropdown from "react-bootstrap/Dropdown";
import { Button } from "react-bootstrap";
const FilterValues = [
  { label: "Trending", value: "trending" },
  { label: "Latest", value: "latest" },
  { label: "Earliest", value: "earliest" },
  { label: "Following", value: "following" },
];

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: "pointer" }}
  >
    {children}
  </div>
));

const AllFilterComponents = ({
  filters,
  filterBySelectFieldHandler,
  filterBySaleType,
}) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const tabs = [{ name: "On sale " }, { name: "Upcoming Sale" }];

  // const [showModal, setShowModal] = useState(false);

  // const handleClose = () => setShowModal(false);

  return (
    <>
      <StyledAllFilterComponents>
        <TabSwitcher
          setCurrentTab={setCurrentTabIndex}
          tabs={tabs}
          initial={null}
          filterBySaleType={filterBySaleType}
          from="AllFilter"
        />
        <div className="filters-div">
          <Dropdown>
            <Dropdown.Toggle as={CustomToggle}>
              <FilterIconSecond />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {FilterValues.map((filter) => (
                <Dropdown.Item
                  key={filter.value}
                  onClick={() => filterBySelectFieldHandler(filter.value)}
                >
                  {filter.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          {/* <Button onClick={() => setShowModal(true)}>open modal</Button> */}
        </div>
      </StyledAllFilterComponents>
      {/* <ModalPlaceBidNFT showModal={showModal} handleClose={handleClose} /> */}
    </>
  );
};

export default AllFilterComponents;
