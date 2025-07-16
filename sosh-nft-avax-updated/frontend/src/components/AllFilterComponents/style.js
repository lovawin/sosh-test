import { Tabs } from "react-bootstrap";
import styled from "styled-components";

export const StyledAllFilterComponents = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 36px;
  margin-bottom: 22px;

  .filters-div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
`;

export const StyledTabs = styled(Tabs)`
  .nav-link {
    font-size: 16px;
    font-weight: normal;
    --bs-nav-tabs-border-width: initial !important;
    --bs-nav-tabs-link-active-color: initial !important;
    -bs-nav-tabs-link-active-bg: initial !important;
    --bs-nav-link-color: initial !important;
  }

  .nav-link.active {
    font-weight: 600;
    --bs-nav-tabs-link-active-bg: initial !important;
  }

  .nav-item {
    position: relative;
  }

  .nav-item .nav-link.active::after {
    content: "";
    display: block;
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(to right, #0066ff, #00ccff);
  }
`;
