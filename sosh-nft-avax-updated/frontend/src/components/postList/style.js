import { StyledCardList } from "components/styled/styledCardList";
import styled from "styled-components";

export const StyledPostListWrapper = styled.div`
  width: 100%;
  padding-bottom: 2.5rem;
  box-sizing: border-box;
  overflow: visible;
  justify-content: space-between;
  border-radius: 0.5rem;
  min-height: calc(100vh - 21.75rem);
  background: transparent;
`;

export const StyledPostList = styled(StyledCardList)``;
