import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "../../styles/mediaSizes";

export const StyledErrorPage = styled.div`
  width: 100%;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.text.primary};

  h2.title {
    font-size: ${(props) => props.theme.typography.title4};
    @media ${deviceQuery.tablet} {
      font-size: ${(props) => props.theme.typography.title3};
    }
  }

  .statusCode {
    font-size: ${convertPxToRem(64)};
    color: ${(props) => props.theme.palette.primary.main};
    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(52)};
    }
  }
  .message {
    font-size: ${convertPxToRem(24)};
    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(18)};
    }
  }

  .error-page-action {
    margin-top: ${convertPxToRem(30)};

    .button {
      min-width: ${convertPxToRem(160)};
    }
  }
`;
