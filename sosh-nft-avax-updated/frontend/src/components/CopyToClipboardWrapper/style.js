import styled from "styled-components";

export const StlyedToolTipContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  .label {
    font-size: ${(props) => props.theme.typography.subtText4};
    overflow-wrap: anywhere;
  }
  .icon {
    margin-left: 1rem;
    height: 1.2rem;
    width: 1.2rem;
    flex-shrink: 0;
  }
`;
