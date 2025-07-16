import styled from "styled-components";

export const StyledTabSwitcher = styled.div`
  border-radius: 50px;
  background-color: ${(props) => props.theme.commonColors};
  /* margin-top: 32px; */
  height: 51px;
  max-width: 304px;

  .buttons-div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    margin-left: 10px;
    margin-right: 10px;
    padding-top: 8px;
    line-height: 16.32px;
    font-size: 14px;
    text-align: center;

    button {
      width: auto;
      height: auto;
      border: none;
      cursor: pointer;
      background-color: ${(props) => props.theme.palette.common.card.hover};
      border-radius: 50px;
      transition: background-color 0.3s, color 0.3s;

      .span {
        font-weight: 400;
      }
    }

    button.selected {
      /* background-color: #00b38a; */
      span {
        font-weight: 600;
      }
    }
  }
`;
