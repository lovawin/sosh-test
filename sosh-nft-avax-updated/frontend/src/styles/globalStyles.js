import { convertPxToRem } from "common/helpers";
import { createGlobalStyle } from "styled-components";
import { deviceQuery } from "./mediaSizes";

export const GlobalStyles = createGlobalStyle`

.App{
  // background-color:white;
  background-color: ${({ theme }) => theme.palette.common.backgroundColor};
  color: ${({ theme }) => theme.palette.text.primary};
}

p{
  font-size: ${({ theme }) => theme.typography.text1};
  line-height:150%;

  @media ${deviceQuery.tablet} {
    font-size: ${({ theme }) => theme.typography.text};
  }

}

.page-heading {
  font-size: ${convertPxToRem(40)};
  margin-bottom: ${convertPxToRem(30)};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(30)};
  }
}

.page-sub-heading {
  font-size: ${convertPxToRem(28)};
  margin-top: ${convertPxToRem(30)};
  margin-bottom: ${convertPxToRem(15)};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(24)};
  }
}

.body-text {
  color: ${(props) => props.theme.palette.text.secondary};
  font-size: ${({ theme }) => theme.typography.text1};
  line-height:150%;

  @media ${deviceQuery.tablet} {
    font-size: ${({ theme }) => theme.typography.text};
  }


}

  .order-list{
    counter-reset: list;
    padding-left:${convertPxToRem(20)};
    margin:  ${convertPxToRem(20)} 0;



    &>li{
      list-style: none;
      margin-bottom: ${convertPxToRem(6)};

      &:before{
        counter-increment: list;
        content: "(" counter(list) ")";
        margin-right:${convertPxToRem(10)};
      }
    }

    &.type-a{

      &>li{
        &:before{
          content: "(" counter(list,lower-alpha) ")";
        }
      }
    }

    &.type-i{

      &>li{
        &:before{
          content: "(" counter(list,lower-roman) ")";
        }
      }
    }

  }

  .tab-list {
    justify-content: space-between;
    padding: 0 ${convertPxToRem(30)};
    border-bottom: 1px solid
      ${({ theme }) => theme.palette.common.border.lightGray};

    @media ${deviceQuery.tablet} {
      padding: 0 ${convertPxToRem(20)};
    }

    .tab-item {
      position: relative;
      flex-shrink:0;
      .tab-link {
        font-weight: 600;
        font-size: ${convertPxToRem(18)};
        line-height: 150%;
        padding: ${convertPxToRem(12)} ${convertPxToRem(30)}
          ${convertPxToRem(20)};
        color: ${({ theme }) => theme.palette.text.primary};
        cursor: pointer;

        @media ${deviceQuery.tablet} {
          padding: ${convertPxToRem(2)} ${convertPxToRem(15)}
            ${convertPxToRem(10)};
          font-size: ${convertPxToRem(16)};
        }

        &.active {
          border: none;
          &:after {
            position: absolute;
            content: "";
            bottom: 0;
            left: 0;
            width: 100%;
            height: ${convertPxToRem(3)};
            border-radius: 5px 5px 0 0;
            background: ${({ theme }) =>
              theme.palette.common.gradientBackground};
          }
        }

        .tab-icon {
          width: ${convertPxToRem(12)};
          height: ${convertPxToRem(12)};
          margin-left: ${convertPxToRem(4)};
        }
      }
    }
  }

  .form-group {
    margin-bottom: ${convertPxToRem(30)};

    @media ${deviceQuery.tablet} {
      margin-bottom: ${convertPxToRem(20)};
    }
  }

  .page-not-found{
    min-height:${convertPxToRem(450)};
  }

  .overlay-backdrop{
    position: fixed;
    width: 100vw;
    height: calc(100vh - ${({ theme }) => theme.navbar.height});
    top: ${({ theme }) => theme.navbar.height};
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

`;
