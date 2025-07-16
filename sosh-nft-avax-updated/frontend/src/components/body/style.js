import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const Main = styled.div`
  ::-moz-selection {
    background: #afafaf;
  }
  ::-webkit-selection {
    background: #afafaf;
  }
  ::selection {
    background: #afafaf;
  }
  padding-bottom: 2.5rem;
  box-sizing: border-box;
  // margin: 0 auto;
  overflow: visible;
  justify-content: space-between;
  border-radius: 0.5rem;
  // margin-right: 1.875rem !important;
  min-height: calc(100vh - 21.75rem);
  width: ${(props) => props.width};
  background-color: white;
`;

export const List = styled.ul`
  flex-flow: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${convertPxToRem(270)}, 1fr));
  grid-gap: ${convertPxToRem(24)};
  // justify-content: start;
  padding: ${convertPxToRem(40)} ${convertPxToRem(37)};

  margin-top: 0;
  margin-bottom: 1em;
  list-style-type: disc;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
`;
