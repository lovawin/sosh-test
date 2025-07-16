import { convertPxToRem } from "common/helpers";
import ModalWrapper from "components/modalWrapper";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledConfirmModal = styled(ModalWrapper)`
  .modal-dialog {
    width: ${convertPxToRem(500)};

    .modal-content {
      padding-bottom: 0;

      .modal-body {
        .modal-body-prepend {
          margin-bottom: ${convertPxToRem(20)};
        }
      }
      .modal-footer {
        border-top: 1px solid
          ${(props) => props.theme.palette.common.border.light};
        padding: 0;
        flex-wrap: nowrap;
        overflow: hidden;
        .btn {
          flex-grow: 1;
          margin: 0;
          border-radius: 0;
          height: ${convertPxToRem(60)};
          font-size: ${convertPxToRem(16)};
          background-color: transparent;
          border: none;

          &:hover {
            background-color: ${(props) =>
              props.theme.palette.common.card.hover};
          }

          &:focus {
            box-shadow: none;
            background-color: ${(props) =>
              props.theme.palette.common.card.hover};
          }

          @media ${deviceQuery.tablet} {
            height: ${convertPxToRem(50)};
          }

          &.cancel-button {
            color: ${(props) => props.theme.palette.text.tertiary};
          }

          &.confirm-button {
            color: ${({ theme, $type }) =>
              $type === "delete" ? "red" : theme.palette.text.primary};
            border-left: 1px solid
              ${(props) => props.theme.palette.common.border.light};
          }
        }
      }
    }
  }
`;
