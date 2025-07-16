import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";
import { convertPxToRem } from "../../common/helpers";

export const Form = styled.div`
  background-color: ${({ theme }) => theme.palette.common.backgroundColor};
  height: 100%;

  padding: ${convertPxToRem(50)} ${convertPxToRem(100)};

  @media ${deviceQuery.laptop} {
    padding: ${convertPxToRem(30)} ${convertPxToRem(50)};
  }

  @media ${deviceQuery.mobile} {
    padding: ${convertPxToRem(20)} ${convertPxToRem(30)};
  }

  .fields-wrap {
    margin-top: ${convertPxToRem(50)};

    @media ${deviceQuery.tablet} {
      margin-top: ${convertPxToRem(30)};
    }
  }

  .create-button {
    min-width: ${convertPxToRem(185)};
    margin-top: ${convertPxToRem(60)};
    margin-left: auto;
  }
`;

export const Desc = styled.p`
  color: ${({ theme }) => theme.palette.text.gray};
`;

export const SelectDiv = styled.div`
  margin-top: ${convertPxToRem(30)};
  .dropdown-toggle {
    min-width: ${convertPxToRem(200)};

    & > span {
      width: 100%;
      justify-content: space-between;
    }

    &::after {
      content: none;
    }

    &:hover {
      color: ${({ theme }) => theme.palette.text.tertiary};
    }

    .chevron-icon {
      width: ${convertPxToRem(14)};
      height: ${convertPxToRem(14)};
      margin-left: ${convertPxToRem(10)};
      transform: rotate(180deg);
    }
  }

  .helper-text {
    margin-top: ${convertPxToRem(10)};
  }
`;

export const Option = styled.option`
  // .sc-hmjpVf
  :hover {
    background-color: #000000 !important;
  }
`;

export const StyledSuggestions = styled.div`
  min-width: ${convertPxToRem(200)};
  max-width: ${convertPxToRem(500)};
  background: ${({ theme }) => theme.palette.common.card.backgroundColor};
  padding: ${convertPxToRem(10)} 0;
  max-height: ${convertPxToRem(300)};
  overflow-y: auto;
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  color: ${({ theme }) => theme.palette.text.primary};

  @media ${deviceQuery.mobile} {
    max-width: 100vw;
  }

  ul {
    padding: 0;
    list-style: none;
    margin-bottom: 0;

    li {
      margin: ${convertPxToRem(3)} 0;
      padding: ${convertPxToRem(5)} ${convertPxToRem(15)};
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${convertPxToRem(14)};

      .post-count {
        font-size: ${convertPxToRem(12)};
      }

      &:hover {
        background-color: ${({ theme }) => theme.palette.common.card.hover};
      }

      @media ${deviceQuery.mobile} {
        font-size: ${convertPxToRem(12)};

        .post-count {
          font-size: ${convertPxToRem(10)};
        }
      }
    }
  }
`;
