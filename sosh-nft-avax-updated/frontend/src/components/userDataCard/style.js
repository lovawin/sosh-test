import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const Main = styled.div`
  background: ${({ theme }) => theme.palette.common.card.backgroundColor};
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  width: 100%;
  overflow: visible;
  padding-top: ${convertPxToRem(20)};
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  overflow: hidden;
  color: ${({ theme }) => theme.palette.text.primary};
  float: right;
  a {
    text-decoration: none;
  }
`;

export const ItemSec = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: ${convertPxToRem(16)} ${convertPxToRem(-8)};
  padding: 0 ${convertPxToRem(20)};

  .link-item {
    margin: ${convertPxToRem(8)};
    line-height: 150%;
    padding: 0;
    font-size: ${({ theme }) => theme.typography.text};
    color: ${({ theme }) => theme.palette.text.gray};

    &:hover {
      color: ${({ theme }) => theme.palette.text.primary};
    }
  }
`;
export const HeadDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 2.813rem;
  padding: 0 ${convertPxToRem(20)};
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  *,
  :after,
  :before {
    box-sizing: border-box;
  }
`;
export const MainDesc = styled.div`
  display: flex;
  align-items: center;
  width: 60%;
`;
export const UserName = styled.span`
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease-in;
  font-size: ${convertPxToRem(18)};
  line-height: 150%;
  font-weight: 600;
`;
export const UserSpan = styled.span`
  // font-family: Inter, sans-serif;
  font-size: ${convertPxToRem(14)};
  font-weight: 600;
  line-height: 150%;
  letter-spacing: 0.3px;
  margin-bottom: 3px;
  width: 100%;
  display: flex;
  margin-left: 0.813rem;
`;
export const UserDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 2rem);
`;
export const ProfileImg = styled.img`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  // width: 25px;
  border-radius: 50%;
  position: relative;
  // background: url(${(props) => props.src}) ;
  // no-repeat 50% / cover;
`;
export const ProfileDesc = styled.span`
  // font-family: Inter, sans-serif;
  font-size: 0.625rem;
  font-weight: 700;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
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
`;
export const ButtonSec = styled.div`
  font-size: 14px;
  padding: 0 ${convertPxToRem(20)};
  margin: ${convertPxToRem(16)} 0;

  .user-action {
    display: flex;
    align-items: center;
    cursor: pointer;

    &:not(:last-child) {
      margin-bottom: ${convertPxToRem(10)};
    }

    .icon {
      width: ${convertPxToRem(18)};
      height: ${convertPxToRem(18)};
      margin-right: ${convertPxToRem(13)};
      color: ${({ theme }) => theme.palette.text.primary};
    }

    .label {
      font-size: ${({ theme }) => theme.typography.text2};
      line-height: 150%;
      margin-bottom: 0;
      color: ${({ theme }) => theme.palette.text.primary};
    }
  }
`;
export const SocialSec = styled.div`
  background: ${({ theme }) => theme.palette.common.gradientBackground};
  color: #ffffff;
  padding: ${convertPxToRem(20)};

  .social-list {
    justify-content: space-between;
    width: ${convertPxToRem(350)};
    max-width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin: auto;

    .social-link {
      color: ${({ theme }) => theme.palette.text.white};
      &:hover {
        opacity: 0.8;
      }

      .icon {
        width: ${convertPxToRem(20)};
        height: ${convertPxToRem(20)};
      }
    }
  }
`;

export const AddressImag = styled.img`
  width: 1.5rem;
`;
export const AddressSec = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 ${convertPxToRem(20)};
`;
export const Balance = styled.span`
  color: ${({ theme }) => theme.palette.text.gray};
  margin-right: 5px;
`;
