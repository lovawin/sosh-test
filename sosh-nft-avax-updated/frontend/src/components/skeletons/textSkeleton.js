import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { range } from "lodash";
import styled from "styled-components";
import { convertPxToRem } from "common/helpers";

const StyledTextSkeleton = styled.div`
  display: flex;
  flex-direction: column;

  .skel-text {
    background-color: ${({ theme }) => theme.palette.common.contrast + "22"};
    width: 100%;
    height: ${convertPxToRem(20)};
    min-width: ${convertPxToRem(100)};

    .title {
      height: ${convertPxToRem(30)};
    }
  }
`;

function TextSkeleton({ type = "body", lines = 1 }) {
  const Texts = useMemo(() => {
    return range(lines);
  }, [lines]);

  return (
    <StyledTextSkeleton>
      {Texts?.map((_, i) => {
        return <span key={i} className={`skel-text ${type}`}></span>;
      })}
    </StyledTextSkeleton>
  );
}

export default TextSkeleton;
TextSkeleton.propTypes = {
  type: PropTypes.oneOf(["title", "body"]),
  lines: PropTypes.number,
};
