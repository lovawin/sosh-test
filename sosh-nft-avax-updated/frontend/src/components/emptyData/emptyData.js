import React from "react";
import PropTypes from "prop-types";

import CustomButton from "components/CustomButton";
import { StyledEmptyData } from "./style";

function EmptyData({ message, actionLabel, action }) {
  const clickHandler = () => {
    action && action();
  };

  return (
    <StyledEmptyData className="empty-data">
      <div className="data-space">
        <p className="message">{message || "Data Not Found"}</p>
        <CustomButton color="gradient" outline onClick={clickHandler}>
          {actionLabel || "Back to Home"}
        </CustomButton>
      </div>
    </StyledEmptyData>
  );
}

export default EmptyData;
EmptyData.propTypes = {
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  action: PropTypes.func,
};
