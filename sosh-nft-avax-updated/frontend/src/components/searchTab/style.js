import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  .follow {
    font-weight: 400;
    margin-right: 0.5rem;
    font-size: ${convertPxToRem(14)};
    line-height: 150%;
  }
  .social-image {
    // z-index: 1;
    width: 1.3rem;
    height: 1.3rem;
    margin-left: 0.5rem;
    // position: absolute;
    // top: ${convertPxToRem(12)};
    // right: ${convertPxToRem(9)};
  }
  background: white;

  width: ${convertPxToRem(500)};
  max-width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  background-color: ${(props) =>
    props.theme.palette.common.card.backgroundColor};
  float: right;
  padding-top: 0.5rem;
`;

export const Container = styled.div`
  overflow-y: auto;
  max-height: ${convertPxToRem(500)};
  margin-bottom: ${convertPxToRem(10)};
  color: ${({ theme }) => theme.palette.text.primary};

  .tab-list {
    .tab-link {
      font-weight: 600;
      font-size: ${convertPxToRem(18)};

      padding: ${convertPxToRem(12)} ${convertPxToRem(30)} ${convertPxToRem(20)};

      @media ${deviceQuery.tablet} {
        padding: ${convertPxToRem(2)} ${convertPxToRem(15)}
          ${convertPxToRem(10)};
        font-size: ${convertPxToRem(16)};
      }
    }
  }

  .data-list {
    margin: ${convertPxToRem(10)} 0;
    .data-list-item {
      padding: ${convertPxToRem(10)} ${convertPxToRem(20)};
      cursor: pointer;
      color: ${({ theme }) => theme.palette.text.primary};

      &:hover {
        background: ${({ theme }) => theme.palette.common.card.hover};
      }
    }

    .no-data {
      padding: ${convertPxToRem(10)} ${convertPxToRem(20)};
      font-size: ${convertPxToRem(16)};
      color: ${({ theme }) => theme.palette.text.gray};
      text-align: center;
      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(14)};
      }
    }

    .data-loader {
      padding: ${convertPxToRem(10)} ${convertPxToRem(20)};
      margin: auto;

      .spinner {
        width: ${convertPxToRem(20)};
      }

      .text {
        font-size: ${convertPxToRem(14)};

        @media ${deviceQuery.tablet} {
          font-size: ${convertPxToRem(12)};
        }
      }
    }
  }

  // height: 8rem;
`;

export const ImgDiv = styled.div`
  text-align: center;
  margin-top: 1.25rem;
`;
export const Img = styled.img`
  width: 7rem;
  height: 7rem;
  border-radius: 20rem;
  margin-right: -2.5rem;
`;
export const Button = styled.button`
  background: none;
  border-radius: 1.563rem;
  height: 1.875rem;
  font-size: 0.75rem;
  margin-left: 0.625rem;
`;
export const HeadDiv = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-grow: 1;
`;

export const TabItem = styled.div`
  font-size: 0.813rem;
  font-weight: 600;
  margin-left: 0.375rem;
  margin-right: 0.375rem;
  :active {
    background: black;
  }
`;

export const ProfileDesc = styled.span`
  // font-family: Inter, sans-serif;

  line-height: 150%;
  letter-spacing: 0.3px;
  text-align: left;
  display: block;
  margin-left: 0.813rem;
  width: 100%;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease-in;
  color: ${({ theme }) => theme.palette.text.secondary};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(14)};
  }
`;
export const UserName = styled.span`
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease-in;
  font-weight: 600;

  font-size: ${convertPxToRem(18)};
  line-height: 150%;
  color: ${({ theme }) => theme.palette.text.primary};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(16)};
  }
`;
export const LogoImg = styled.img`
  width: 0.75rem;
  margin-right: 0.438rem;
`;
export const UserSpan = styled.span`
  // font-family: Inter, sans-serif;
  font-size: 0.813rem;
  font-weight: 700;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: 0.3px;
  text-align: left;
  color: #2c2a38;
  margin-bottom: 0.188rem;
  width: 100%;
  display: flex;
  margin-left: 0.813rem;
`;
export const UserDiv = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const ProfileImg = styled.div`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  // width: 25px;
  border-radius: 50%;
  position: relative;
  background: url(${(props) => props.img}) no-repeat 50% / cover;
`;
export const Follower = styled.span`
  // font-family: Inter, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #2c2a38;
  height: 0.938rem;
`;
