import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};

  .nft-details-wrap {
    margin-top: ${convertPxToRem(20)};

    @media ${deviceQuery.tablet} {
      margin-top: ${convertPxToRem(15)};
    }

    .nft-title {
      font-size: ${convertPxToRem(18)};
      color: ${({ theme }) => theme.palette.text.primary};
      font-weight: 600;
      line-height: 150%;
      margin-bottom: 1rem;
      letter-spacing: 0.3px;

      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(16)};
      }
    }

    .nft-description {
      width: max(${convertPxToRem(340)}, 24vw);
      word-wrap: break-word;
      font-size: ${convertPxToRem(16)};
      color: ${({ theme }) => theme.palette.text.primary};
      line-height: 150%;

      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(14)};
      }
    }

    .nft-hashtags {
      margin-top: ${convertPxToRem(5)};
      font-size: ${convertPxToRem(16)};
      font-weight: 600;
      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(14)};
      }
    }
  }

  padding: 0.625rem;
  border-radius: 0.625rem;
  position: relative;

  .dropdown {
    position: absolute;
    top: ${convertPxToRem(5)};
    right: ${convertPxToRem(15)};

    .dropdown-menu {
      margin-top: ${convertPxToRem(4)};
    }

    .menu-icon-wrap {
      width: ${convertPxToRem(30)};
      height: ${convertPxToRem(30)};
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .menu-kebab-icon {
        width: ${convertPxToRem(20)};
        height: ${convertPxToRem(20)};
        transform: rotate(90deg);
      }
    }
  }

  .tab-list {
    padding: 0 ${convertPxToRem(6)};
    overflow: auto;
    flex-wrap: nowrap;

    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.palette.common.contrast + "55"};
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background-color: ${({ theme }) => theme.palette.common.contrast + "11"};
      border-radius: 4px;
    }

    .tab-item {
      .tab-link {
        padding: ${convertPxToRem(12)} ${convertPxToRem(10)};
        font-size: ${convertPxToRem(15)};

        @media ${deviceQuery.mobile} {
          font-size: ${convertPxToRem(13)};
        }
      }
    }
  }

  .tab-data {
    .comment-list {
      max-height: ${convertPxToRem(400)};
      overflow: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) =>
          theme.palette.common.contrast + "55"};
        border-radius: 4px;
      }
      &::-webkit-scrollbar-track {
        background-color: ${({ theme }) =>
          theme.palette.common.contrast + "11"};
        border-radius: 4px;
      }
    }
  }

  .additional {
    margin-top: 1rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .additional-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: ${convertPxToRem(10)};
  }
  .head {
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .desc {
    font-size: 0.8rem;
    word-break: break-all;
    flex-shrink: 0;
    margin-left: ${convertPxToRem(40)};
    min-width: 0;
    flex: 1;
    text-align: right;

    .copy-btn {
      justify-content: flex-end;
      .copy-icon {
        margin-left: 6px;
        width: 16px;
      }
    }

    .ellipsed {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
  }
`;

export const ImgDiv = styled.div`
  text-align: center;
  margin-top: 1.25rem;

  .share-icon-wrap {
    float: right;
  }

  .owner-name {
    font-size: ${convertPxToRem(18)};
    font-weight: 600;
    margin-bottom: 0;
    margin-top: ${convertPxToRem(10)};
    line-height: 150%;
  }
  .owner-username {
    font-size: ${convertPxToRem(14)};
  }
`;
export const Img = styled.img`
  width: 7rem;
  height: 7rem;
  border-radius: 20rem;
`;
export const Button = styled.button`
  background: none;
  border-radius: 1.7rem;
  border: 1px solid #c0c0c0;
  height: 1.875rem;
  font-size: 0.75rem;
  margin-left: 0.625rem;
`;
export const HeadDiv = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  // height: 100%;

  .profle-link {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .actions-wrapper {
    padding: ${convertPxToRem(16)} 0;
    display: flex;
    align-items: center;
    margin: 0 ${convertPxToRem(-5)};

    .button {
      margin: ${convertPxToRem(5)};
    }
  }

  .owner-wrap {
  }
`;

export const Tab = styled.div`
  display: flex;
`;

export const TabItem = styled.div`
  font-size: 0.813rem;
  font-weight: 600;
  margin-left: 0.375rem;
  margin-right: 0.375rem;
  cursor: pointer;
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
  color: ${({ theme }) => theme.palette.text.primary};
  margin-left: 0.813rem;
  width: 100%;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease-in;
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
  flex-grow: 1;
  min-width: 0;
  margin-left: ${convertPxToRem(8)};
  .name,
  .username {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0;
  }

  .name {
    font-size: ${convertPxToRem(14)};
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.primary};

    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(12)};
    }
  }

  .username {
    font-size: ${convertPxToRem(12)};
    color: ${({ theme }) => theme.palette.text.tertiary};
    &::before {
      content: "@";
    }

    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(10)};
    }
  }
`;
export const MainDesc = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
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

export const Desc = styled.p``;

export const SuggestedProfileImg = styled.div`
  width: 2rem;
  height: 2rem;
  float: right;
  min-width: 2rem;
  // width: 25px;
  border-radius: 50%;
  position: relative;
  background: url(${(props) => props.img}) no-repeat 50% / cover;
`;

export const StyledOwner = styled.div`
  margin: ${convertPxToRem(30)} 0;
  display: flex;
  align-items: center;
  width: 100%;
`;
