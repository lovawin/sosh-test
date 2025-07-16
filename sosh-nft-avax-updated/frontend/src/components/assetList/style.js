import { StyledCardList } from "components/styled/styledCardList";
import styled from "styled-components";

export const StyledAssetListWrapper = styled.div`
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
`;

export const StyledAssetList = styled(StyledCardList)``;
