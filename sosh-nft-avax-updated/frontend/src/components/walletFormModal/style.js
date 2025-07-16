import { convertPxToRem } from "common/helpers";
import ModalWrapper from "components/modalWrapper";
import styled from "styled-components";

export const StyledRegisterModal = styled(ModalWrapper)`
  .modal-dialog {
    width: ${convertPxToRem(480)};

    .modal-content {
      .modal-body {
        padding: ${convertPxToRem(10)} ${convertPxToRem(25)}
          ${convertPxToRem(20)};
        color: ${(props) => props.theme.palette.text.primary};

        .address-wrapper {
          border: 1px solid gainsboro;
          border-radius: 5px;
          padding: 5px;
          padding-left: 10px;
          padding-right: 10px;
          margin-bottom: ${convertPxToRem(40)};
          .address {
            font-size: ${convertPxToRem(14)};
            line-height: 150%;
            margin-bottom: 0;
            overflow-wrap: break-word;
            text-align: left;
          }
        }

        .form-title {
          font-weight: bold;
          font-size: ${convertPxToRem(22)};
          line-height: 150%;
          color: ${(props) => props.theme.palette.text.primary};
        }

        .text-input-wrap {
          text-align: left;
          margin-bottom: ${convertPxToRem(8)};
        }

        .footer-message {
          color: ${(props) => props.theme.palette.text.tertiary};
          font-size: ${convertPxToRem(14)};
          line-height: 150%;
          text-align: center;
          margin: auto;
          margin-top: 2rem;
        }

        .submit-button {
          width: 100%;
        }
      }
    }
  }
`;

export const Address = styled.span`
  font-size: 0.9rem;
  word-wrap: break-word;
`;
export const Span = styled.span`
  font-size: 0.7rem;
  color: gray;
  font-weight: 600;
`;

export const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  width: 100%;
`;

export const Button = styled.button`
z-index:2;
// float: center;
text-align:center;
background: linear-gradient(90deg, #005BEA -2.59%, #00C6FB 160.54%), linear-gradient(96.76deg, #FFA17F -44.56%, #00223E 189.36%), #C4C4C4;
color:#FFFFFF;
        font-family: Inter,sans-serif;
        font-weight: 700;
        flex-shrink: 0;
        // width: fit-content!important;
                height: 1.875rem;
        border-radius: 1.063rem;
        line-height: 0.938rem;
        color: #fff;
        padding: 0 1.063rem;
    font-size: 0.75rem;
    width:100%;
    border:none;
}

`;

export const Div = styled.div`
  margin-bottom: 2rem;
`;
export const CheckDiv = styled.div`
  display: flex;
  text-align: center;
  justify-content: center;
  margin-bottom: ${convertPxToRem(10)};

  .checkmark-wrap {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: center;

    .checkmark {
      margin-left: ${convertPxToRem(10)};
    }

    .checkbox-label {
      font-size: ${convertPxToRem(16)};
      line-height: 150%;
      font-weight: normal;
      margin-bottom: 0;
    }
  }
`;

export const CheckBox = styled.input`
  width: min-content;
`;
