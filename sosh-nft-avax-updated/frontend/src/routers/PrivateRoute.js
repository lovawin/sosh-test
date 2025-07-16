import React from "react";
import PropTypes from "prop-types";

import { Navigate } from "react-router-dom";
import { checkIfLogin } from "common/common";
import Routes from "constants/routes";
import { useSelector } from "react-redux";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";

function PrivateRoute({ children }) {
  const { isLoginLoading } = useSelector((state) => state.login);

  if (isLoginLoading) {
    return <LoadingBubbleCircle />;
  } else if (checkIfLogin()) {
    return <>{children}</>;
  } else {
    return <Navigate replace to={Routes.home} />;
  }
}

export default PrivateRoute;
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
