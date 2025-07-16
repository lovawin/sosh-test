import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledCardList = styled.ul`
  flex-flow: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${convertPxToRem(270)}, 1fr));
  grid-gap: ${convertPxToRem(24)};
  // justify-content: start;

  @media ${deviceQuery.tablet} {
    grid-template-columns: repeat(
      auto-fill,
      minmax(${convertPxToRem(230)}, 1fr)
    );
    grid-gap: ${convertPxToRem(20)};
  }

  margin-bottom: 1em;
  list-style-type: disc;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
`;
