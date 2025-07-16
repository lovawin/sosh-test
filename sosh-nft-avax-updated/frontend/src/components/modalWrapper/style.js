import styled from "styled-components";
import { Modal as RectBootstrapModal } from "react-bootstrap";
import { deviceQuery } from "styles/mediaSizes";
import { convertPxToRem } from "common/helpers";

export const StyledModalWrapper = styled(RectBootstrapModal)`
  .modal-dialog {
    max-width: ${`calc(100% - ${convertPxToRem(20)})`};
    margin-right: auto;
    margin-left: auto;

    .modal-content {
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
      color: ${(props) => props.theme.palette.text.primary};
      background-color: ${(props) =>
        props.theme.palette.common.card.backgroundColor};
      padding: ${`${convertPxToRem(20)} 0`};
      @media ${deviceQuery.tablet} {
        padding: ${`${convertPxToRem(10)} $0`};
      }

      .modal-header {
        border: none;
        justify-content: center;
        .modal-title {
          font-size: ${convertPxToRem(28)};
          font-weight: bold;

          text-align: center;

          @media ${deviceQuery.tablet} {
            font-size: ${convertPxToRem(24)};
          }
        }
      }

      .close-button-container {
        position: absolute;
        top: ${convertPxToRem(12)};
        right: ${convertPxToRem(15)};
        width: ${convertPxToRem(20)};
        height: ${convertPxToRem(20)};
        text-align: center;

        @media ${deviceQuery.tablet} {
          top: ${convertPxToRem(10)};
          right: ${convertPxToRem(10)};
          width: ${convertPxToRem(18)};
          height: ${convertPxToRem(18)};
        }

        cursor: pointer;
        flex-shrink: 0;
        .close-button {
          width: 100%;
          height: 100%;
        }
      }

      .modal-body {
        text-align: center;
        width: ${(props) => (props.width ? props.width : "100%")};
        margin: auto;
        line-height: 150%;
      }

      .modal-footer {
        border: none;
      }
    }
  }
`;
