import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  display: flex;
  align-items: center;
  background: transparent;

  width: ${convertPxToRem(820)};
  max-width: 100%;
  margin: ${convertPxToRem(30)} auto ${convertPxToRem(50)};
  flex-flow: column;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};

  @media ${deviceQuery.tablet} {
    border: none;
  }

  .tab-list {
    padding: 0 ${convertPxToRem(50)};
    width: 100%;
    justify-content: space-around;

    @media ${deviceQuery.tablet} {
      padding: 0;
    }

    .tab-item {
      .tab-link {
        padding: ${convertPxToRem(20)} ${convertPxToRem(10)};
        font-weight: normal;

        @media ${deviceQuery.tablet} {
          padding: ${convertPxToRem(10)} ${convertPxToRem(5)};
        }
      }
    }
  }

  .tab-content {
    padding: ${convertPxToRem(70)} ${convertPxToRem(100)};
    width: 100%;

    @media ${deviceQuery.laptop} {
      padding: ${convertPxToRem(50)} ${convertPxToRem(80)};
    }

    @media ${deviceQuery.tablet} {
      padding: ${convertPxToRem(40)} 0;
    }

    @media ${deviceQuery.mobile} {
      padding: ${convertPxToRem(30)} 0;
    }
  }
`;
export const Tab = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  // border-bottom: 2px solid gray;
`;
export const Item = styled.div`
  cursor: pointer;
  font-size: 1rem;
  :hover {
    // color: blue;
    border-bottom: 2px solid blue;
    // z-index: 1;
    // overflow: ;
  }
  .active {
    color: blue;
    border-bottom: 2px solid blue;
  }
  :focus-visible {
    color: blue;
  }
`;
