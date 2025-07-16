import { convertPxToRem } from "common/helpers";
import { Link } from "react-router-dom";
import styled from "styled-components";

export const StyledHashTag = styled(Link)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: ${convertPxToRem(16)};
  font-weight: ${({ $bold }) => ($bold ? 600 : "normal")};
  text-decoration: none;
  opacity: 0.8;

  &:hover {
    color: ${({ theme }) => theme.palette.text.primary};
    opacity: 1;
  }
`;
