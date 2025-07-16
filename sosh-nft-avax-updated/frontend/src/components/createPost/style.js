import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Form = styled.div`
  background-color: ${({ theme }) => theme.palette.common.contrast + "10"};
  height: 100%;
  padding: ${convertPxToRem(50)} ${convertPxToRem(100)};

  @media ${deviceQuery.laptop} {
    padding: ${convertPxToRem(30)} ${convertPxToRem(50)};
  }

  @media ${deviceQuery.mobile} {
    padding: ${convertPxToRem(20)} ${convertPxToRem(30)};
  }

  .fields-wrap {
    margin-top: ${convertPxToRem(50)};

    @media ${deviceQuery.tablet} {
      margin-top: ${convertPxToRem(30)};
    }
  }

  .helper-message-wrap {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${convertPxToRem(10)};

    .message {
      margin-bottom: 0;
    }

    .icons-wrap {
      flex-shrink: 0;
    }
  }

  .link-verify-button {
    min-width: ${convertPxToRem(185)};
    margin-top: ${convertPxToRem(40)};
  }
`;

export const Head = styled.h3`
  font-size: 1.3rem;

  @media (max-width: 1000px) {
    font-size: 1.15rem;
  }

  @media (max-width: 800px) {
    font-size: 1rem;
  }
`;

export const Desc = styled.p`
  color: ${({ theme }) => theme.palette.text.gray};
`;

export const Image = styled.img`
  width: 14rem;
  height: 12rem;
`;

export const HeadDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 1rem;
`;

export const CheckBox = styled.input`
   margin-top: 20px;
`;

export const Data = styled.input`
  outline: none;
  border: none;
  border-bottom: 1px solid;
  background: none;
  font-size: 0.813rem;
  color: gray;
  margin-left: 1rem;
  margin-top:10px;
`;

export const ErrorMessage = styled.div`
  color: red;
  font-size: 0.75rem;
  margin-top: 5px;
`;


export const ButtonHollow = styled.button`
  font-size: 16px;
  padding: 0;
  border: 2px double transparent;
  border-radius: 5rem;
  border-width: 2px 0px 2px 2px;
  background-image: ${(props) =>
    props.color === "gradient"
      ? "linear-gradient(90deg, #005bea -2.59%, #00c6fb 160.54%)"
      : "linear-gradient(#fff, #fff)"};
  /* color: #02212c; */
  background-origin: border-box;
  background-clip: content-box, border-box;
  font-family: Inter, sans-;
  font-weight: 500;
  flex-shrink: 0;
  width: 25%;
  height: 56px;

  margin-bottom: 10px;
  border-radius: ${(props) => props.radius};

  @media (max-width: 1000px) {
    width: 35%;
  }

  @media (max-width: 800px) {
    width: 45%;
  }
`;

export const ImgDiv = styled.div`
  width: 100%;
  text-align: center;
  padding: 1.25rem;
`;

export const ButtonDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Div = styled.div`
  margin-bottom: ${(props) => props.margin};
  display: ${(props) => props.display};
  justify-content: ${(props) => props.justy};

  .icon-wrap {
    width: ${convertPxToRem(24)};
    height: ${convertPxToRem(24)};
    padding: ${convertPxToRem(3)};
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-left: ${convertPxToRem(8)};
    border-radius: 50%;
    background: ${({ theme }) => theme.palette.text.gray};
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }

    &.active {
      background: ${({ theme }) => theme.palette.gradient.main};

      .icon {
        color: ${({ theme }) => theme.palette.text.white};
      }
    }

    .icon {
      width: ${convertPxToRem(14)};
      height: ${convertPxToRem(14)};
      color: ${({ theme }) => theme.palette.common.backgroundColor};
    }
  }
`;
