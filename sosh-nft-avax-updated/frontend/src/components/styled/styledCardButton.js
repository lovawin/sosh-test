import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledCardButton = styled.button`
  color: ${({ theme }) => theme.palette.text.gray};
  background: transparent;
  border: none;
  outline: none;
  border-radius: ${convertPxToRem(50)};
  padding: ${({ $noLabel }) =>
    $noLabel
      ? convertPxToRem(8)
      : `${convertPxToRem(5)} ${convertPxToRem(10)}`};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color, border-color 0.2s ease-in-out;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => `${theme.palette.text.primary}11`};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .icon {
    width: ${convertPxToRem(16)};
    height: ${convertPxToRem(16)};
    margin-right: ${({ $noLabel }) => ($noLabel ? 0 : convertPxToRem(5))};
  }
`;
