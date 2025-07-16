import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledMessageWrapper = styled.div`
  background: ${({ theme }) => theme.palette.common.gradientBackground};
  width: 100%;
  margin-top: ${convertPxToRem(20)};
  color: ${({ theme }) => theme.palette.text.white};
  padding: ${convertPxToRem(16)};
  display: flex;
  justify-content: space-between;
  align-items: center;

  .social-link-message {
    text-align: center;
    flex-grow: 1;
    font-weight: 500;
    font-size: ${convertPxToRem(18)};
    line-height: 150%;
    margin-bottom: 0;

    .link-icon {
      margin-right: ${convertPxToRem(8)};
      width: ${convertPxToRem(18)};
      height: ${convertPxToRem(18)};
    }

    .text-strong {
      font-weight: 600;
    }
  }

  .close-icon-wrap {
    flex-shrink: 0;
    padding: ${convertPxToRem(3)};
    border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
    transition: background-color 0.3s ease-in-out;
    width: ${convertPxToRem(30)};
    height: ${convertPxToRem(30)};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
      background: ${({ theme }) => theme.palette.common.black + "22"};
    }

    .close-icon {
      width: ${convertPxToRem(20)};
      height: ${convertPxToRem(20)};
    }
  }
`;
