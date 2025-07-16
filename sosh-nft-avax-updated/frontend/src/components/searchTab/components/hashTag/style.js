import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledHashtag = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;

  .hash-sign {
    width: ${convertPxToRem(30)};
    height: ${convertPxToRem(30)};
    padding: 1px;
    background-image: ${({ theme }) => `linear-gradient(#fff, #fff),
        radial-gradient(
          circle at top left,
          ${theme.palette.primary.main},
          ${theme.palette.secondary.main}
        )`};
    background-origin: border-box;
    background-clip: content-box, border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${convertPxToRem(10)};
    border-radius: 50%;
    background: ${({ theme }) => theme.palette.white.primary};
    color: ${({ theme }) => theme.palette.text.darkGray};
    font-weight: 500;
    line-height: 1;
  }

  .hash-tag {
    margin-bottom: 0;
    font-size: ${convertPxToRem(14)};
    color: ${({ theme }) => theme.palette.text.primary};
    font-weight: 600;

    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(12)};
    }
  }
  .post-count {
    font-size: ${convertPxToRem(12)};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: ${convertPxToRem(12)};
  }
`;
