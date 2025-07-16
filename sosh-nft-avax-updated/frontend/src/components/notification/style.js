import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  display: flex;
  flex-flow: column;
  font-family: Poppins;
  font-style: normal;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${convertPxToRem(20)};

  border-bottom: 1px solid ${({ theme }) => theme.palette.common.border.light};

  @media ${deviceQuery.tablet} {
    padding: ${convertPxToRem(20)} ${convertPxToRem(10)};
  }
`;

export const Heading = styled.div`
  font-weight: 800;
  font-size: ${convertPxToRem(32)};
  margin-bottom: ${convertPxToRem(20)};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(28)};
  }

  @media ${deviceQuery.mobile} {
    font-size: ${convertPxToRem(24)};
  }
`;
export const Text = styled.div`
  font-weight: 600;
  font-size: ${convertPxToRem(18)};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(16)};
  }
`;
export const HeadDiv = styled.div`
  width: ${convertPxToRem(400)};
  max-width: 100%;
`;
export const CheckBox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  margin-top: 0.7rem;
  float: right;
  @media (max-width: 1000px) {
    display: block !important;
    width: 1rem;
    height: 1rem;
  }
`;
