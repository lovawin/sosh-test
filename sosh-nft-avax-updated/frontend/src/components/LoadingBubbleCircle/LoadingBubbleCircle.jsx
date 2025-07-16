import { range } from "lodash";
import { StyledLoadingSpinningBubbles } from "./style";
import PropTypes from "prop-types";
import { useEffect } from "react";

const LoadingBubbleCircle = ({ style }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <StyledLoadingSpinningBubbles style={style}>
      <div className="loader">
        {range(0, 8).map((_, idx) => (
          <div class="bubble-container" key={idx}>
            <div class="bubble"></div>
          </div>
        ))}
      </div>
    </StyledLoadingSpinningBubbles>
  );
};

LoadingBubbleCircle.propTypes = {
  style: PropTypes.object,
};

export default LoadingBubbleCircle;
