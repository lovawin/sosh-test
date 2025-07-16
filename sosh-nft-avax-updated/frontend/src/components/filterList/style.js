import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledFilters = styled.div`
  width: ${convertPxToRem(300)};

  .list-title {
    font-weight: 500;
    font-size: ${convertPxToRem(18)};
    line-height: 150%;
    margin-bottom: ${convertPxToRem(20)};
  }

  @media (max-width: 1000px) {
    font-size: 1rem;
  }

  .list-group {
    border: 1px solid ${({ theme }) => theme.palette.common.border.light};
    padding: ${convertPxToRem(50)} ${convertPxToRem(4)};
    border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
    .list-group-item {
      border-width: 0;
      background: transparent;
      color: ${({ theme }) => theme.palette.text.primary};

      .checkmark-wrap {
        justify-content: space-between;
        flex-direction: row-reverse;

        .label {
          font-size: ${convertPxToRem(18)};
          font-weight: normal;
          line-height: 150%;
          flex-grow: 1;
          cursor: pointer;
        }
      }
    }
  }
`;
