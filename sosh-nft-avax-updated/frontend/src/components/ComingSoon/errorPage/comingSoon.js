import CustomButton from "components/CustomButton";
import { StyledErrorPage } from "./style";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";

function ComingSoonPage({
  statusCode = "We’ll be live shortly.",
  message = "Stay tuned for exciting updates and a brand new experience coming your way!",
  title = "Coming Soon !",
  showOnlyMessage = false,
  action = null,
  showAction = false,
  actionLabel,
  containerClass = "",
  ...props
}) {
  const navigate = useNavigate();

  const actionHandler = () => {
    if (action) {
      action();
    } else {
      navigate(-1);
    }
  };

  return (
    <StyledErrorPage
      className={`card-body${containerClass ? ` ${containerClass}` : ""}`}
      {...props}
    >
      {!showOnlyMessage && (
        <>
          <h2 className="card-title title">{title}</h2>
          <p className="card-text statusCode">{statusCode}</p>
        </>
      )}
      <p className="card-text message">{message}!</p>

      {showAction && (
        <div className="error-page-action">
          <CustomButton color="gradient" outline onClick={actionHandler}>
            {actionLabel || "Go Back"}
          </CustomButton>
        </div>
      )}
    </StyledErrorPage>
  );
}

export default ComingSoonPage;

ComingSoonPage.propTypes = {
  statusCode: PropTypes.oneOf([404, 500]),
  title: PropTypes.string,
  message: PropTypes.string,
  showOnlyMessage: PropTypes.bool,
  actionLabel: PropTypes.string,
  action: PropTypes.func,
  showAction: PropTypes.bool,
  containerClass: PropTypes.string,
};
