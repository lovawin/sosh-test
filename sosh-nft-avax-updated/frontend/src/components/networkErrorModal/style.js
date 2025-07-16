import { convertPxToRem } from "common/helpers";
import ModalWrapper from "components/modalWrapper";
import styled from "styled-components";

export const StyledNetworkErrorModal = styled(ModalWrapper)`
  .modal-dialog {
    width: ${convertPxToRem(480)};

    .modal-content {
      padding: ${convertPxToRem(35)} ${convertPxToRem(30)};
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
      .modal-body {
        color: ${(props) => props.theme.palette.text.primary};
        line-height: 150%;

        .modal-title {
          font-size: ${({ theme }) => theme.typography.title2};
          font-weight: bold;
        }

        .error-message {
          font-size: ${({ theme }) => theme.typography.text2};
          color: ${(props) => props.theme.palette.text.secondary};
        }
      }
    }
  }
`;
