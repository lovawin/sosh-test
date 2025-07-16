import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Form = styled.form`
  .edit-submit-button {
    width: ${convertPxToRem(185)};
    max-width: 100%;
    float: right;
  }

  .form-group {
    .email-field,
    .website-field {
      input {
        border: none;
        padding-left: ${convertPxToRem(10)};

        &::placeholder {
          color: ${({ theme }) => theme.palette.text.tertiary};
          font-size: ${convertPxToRem(14)};

          @media ${deviceQuery.mobile} {
            font-size: ${convertPxToRem(12)};
          }
        }
      }

      border: 1px solid ${(props) => props.theme.palette.common.border.gray};
      border-width: 0 0 1px 0;
    }
  }
`;

export const ImgDiv = styled.div`
  display: flex;
  text-align: center;
  display: flex;
  // flex-flow: column;
  // margin: auto;
  width: fit-content;
  align-items: center;
  margin-bottom: ${convertPxToRem(30)};

  .avatar-wrap {
    .image-wrap {
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
    }
  }
  .buttons-wrap {
    display: flex;
    align-items: center;
    margin-left: ${convertPxToRem(10)};
    flex-wrap: wrap;

    .button {
      height: ${convertPxToRem(35)};
      font-size: ${convertPxToRem(14)};
      margin: ${convertPxToRem(5)};
      min-width: ${convertPxToRem(120)};
    }
  }
`;
export const Div = styled.div``;

export const InputImg = styled.input`
  color: #fff;
  margin-left: 2rem;
  width: auto;
`;
