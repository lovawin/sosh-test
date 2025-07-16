import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyledTabSwitcher } from "./style";
import CustomButton from "components/CustomButton";

const TabSwitcher = ({
  tabs,
  initial = 0,
  setCurrentTab,
  from,
  filterBySaleType,
  myProfileFilter,
}) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(initial);

  const CurrentComponent =
    currentTabIndex !== null ? tabs[currentTabIndex].component : null;
  console.log("currentTabIndex", currentTabIndex);

  const handleSaleType = useCallback(
    (idx) => {
      filterBySaleType(idx);
    },
    [filterBySaleType]
  );

  return (
    <div>
      <StyledTabSwitcher>
        <div className="buttons-div">
          {tabs.map((tab, idx) => (
            <CustomButton
              color={idx === currentTabIndex ? "gradient" : ""}
              outline
              key={tab.name}
              onClick={() => {
                if (currentTabIndex === idx) {
                  setCurrentTabIndex(null);
                  from === "AllFilter"
                    ? handleSaleType(null)
                    : myProfileFilter(null);
                } else {
                  setCurrentTabIndex(idx);
                  if (from === "AllFilter") {
                    handleSaleType(idx);
                  }
                  if (from === "myProfile") {
                    myProfileFilter(idx);
                    setCurrentTab(idx);
                  }
                }
              }}
              className={idx === currentTabIndex ? "selected" : ""}
            >
              <span>{tab.name}</span>
            </CustomButton>
          ))}
        </div>
      </StyledTabSwitcher>
      {CurrentComponent && (
        <CurrentComponent title={tabs[currentTabIndex].name} />
      )}
    </div>
  );
};

TabSwitcher.propTypes = {
  tabs: PropTypes.array,
  initial: PropTypes.number,
  setCurrentTab: PropTypes.func,
};

export default TabSwitcher;
