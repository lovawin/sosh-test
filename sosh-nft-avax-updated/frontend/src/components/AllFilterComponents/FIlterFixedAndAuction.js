import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import { StyledTabs } from "./style";

const FilterFixedAndAuction = ({ saleType, initital }) => {
  const handleSelect = (key) => {
    if (key === "fixed") {
      console.log("yes");
      saleType("fixed");
    } else if (key === "auction") {
      saleType("auction");
    }
  };

  return (
    <StyledTabs
      defaultActiveKey="fixed"
      id="filter-tabs"
      onSelect={handleSelect}
    >
      <Tab eventKey="fixed" title="Fixed Price">
        {/* Content for Fixed Price */}
      </Tab>
      <Tab eventKey="auction" title="Auction">
        {/* Content for Auction */}
      </Tab>
    </StyledTabs>
  );
};

export default FilterFixedAndAuction;
