import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  width: 100%;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  padding: 0.8rem;
  margin-bottom: ${convertPxToRem(20)};

  .user-avatar {
    .image-wrap {
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
    }
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: ${({ theme }) => theme.palette.text.primary};
    margin-bottom: ${convertPxToRem(20)};
    background-color: ${({ theme }) => theme.palette.common.backgroundColor};

    .back-btn {
      background: transparent;
      outline: none;
      border: none;
      font-weight: 700;
      font-size: 1.5rem;
      color: ${({ theme }) => theme.palette.text.primary};
      .arrow-left {
        width: ${convertPxToRem(20)};
      }
    }

    .title {
      margin: 0 0 0 ${convertPxToRem(10)};
      font-weight: 600;
      font-size: ${convertPxToRem(18)};

      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(16)};
      }
    }
  }

  .users-list {
    overflow: auto;
    max-height: ${convertPxToRem(400)};
  }

  .user-details-container {
    display: flex;

    @media ${deviceQuery.mobile} {
      flex-direction: column;
      align-items: center;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      margin-left: ${convertPxToRem(18)};
      align-items: flex-start;

      @media ${deviceQuery.mobile} {
        align-items: center;
        margin-left: 0;
        margin-top: ${convertPxToRem(18)};
      }

      .name {
        font-size: ${convertPxToRem(18)};
        font-weight: 600;
        color: ${({ theme }) => theme.palette.text.primary};
        margin: 0;

        @media ${deviceQuery.mobile} {
          font-size: ${convertPxToRem(14)};
        }
      }
      .username {
        font-size: ${convertPxToRem(14)};
        color: ${({ theme }) => theme.palette.text.secondary};
        margin: 0;

        &::before {
          content: "@";
        }

        @media ${deviceQuery.mobile} {
          font-size: ${convertPxToRem(12)};
        }
      }

      .counts-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        margin: ${convertPxToRem(25)} ${convertPxToRem(-12)} 0;

        @media ${deviceQuery.mobile} {
          margin-top: ${convertPxToRem(16)};
          justify-content: center;
        }

        .count-item {
          padding: 0 ${convertPxToRem(12)};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 150%;

          &.interactive {
            cursor: pointer;
          }

          .count {
            font-size: ${convertPxToRem(13)};
          }

          .label {
            font-size: ${convertPxToRem(15)};
          }
        }
      }
    }
  }
  .bio {
    width: max(${convertPxToRem(340)}, 24vw);
    word-wrap: break-word;
  }
  .unfollo-div {
    display: flex;
    justify-content: space-between;
  }
  .new-post-button {
    min-width: ${convertPxToRem(160)};
  }

  .social-username-list {
    display: flex;
    flex-wrap: wrap;
    margin: ${convertPxToRem(10)} ${convertPxToRem(-5)};
    .social-username {
      margin: ${convertPxToRem(5)};
      display: flex;
      align-items: center;
      color: ${({ theme }) => theme.palette.text.primary};
      border-radius: ${convertPxToRem(50)};
      padding: ${convertPxToRem(5)} ${convertPxToRem(10)};
      transition: background-color, color 0.2s ease-in-out;

      &:hover {
        background: ${({ theme }) => `${theme.palette.common.contrast}05`};
        color: ${({ theme }) => theme.palette.text.secondary};
      }

      .social-username-icon {
        width: ${convertPxToRem(16)};
        margin-right: ${convertPxToRem(5)};
      }
    }
  }

  .social-icons-list {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 ${convertPxToRem(-20)};
    .icon-wrap {
      width: ${convertPxToRem(30)};
      height: ${convertPxToRem(30)};
      background-color: ${({ theme }) => theme.palette.black.main};
      color: ${({ theme }) => theme.palette.black.text};
      border-radius: 50%;
      padding: ${convertPxToRem(5)};
      margin: 0 ${convertPxToRem(20)};
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
  }

  .referral-link-container {
    .referral-link-title {
      font-size: ${convertPxToRem(14)};
      font-weight: 600;
      color: ${({ theme }) => theme.palette.text.primary};
      margin-bottom: 0;
      letter-spacing: 0.5px;
    }
    .referral-link-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .referral-link {
        width: calc(100% - ${convertPxToRem(48)});
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .referral-share-icon-wrap {
        width: ${convertPxToRem(40)};
        height: ${convertPxToRem(40)};
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        cursor: pointer;

        &:hover {
          background: ${({ theme }) => `${theme.palette.common.contrast}05`};
          color: ${({ theme }) => theme.palette.text.secondary};
        }

        .referral-share-icon {
          width: ${convertPxToRem(20)};
          height: ${convertPxToRem(20)};
        }
      }
    }
  }

  .profile-follow-button {
    width: 100%;
    line-height: 150%;

    & > span {
      .spinner {
        width: ${convertPxToRem(18)};
        height: ${convertPxToRem(18)};
      }
    }
  }
`;

export const FollowersWrap = styled.div`
  width: 100%;
  max-width: 100%;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  margin-top: ${convertPxToRem(10)};
  max-height: ${convertPxToRem(340)};
  overflow: auto;

  .list-title {
    padding: ${convertPxToRem(15)} ${convertPxToRem(20)};
    font-weight: 600;
    font-size: ${convertPxToRem(18)};
    line-height: 150%;
    margin: 0;
    position: sticky;
    top: 0;
    z-index: 9;
    border-bottom: 1px solid
      ${({ theme }) => theme.palette.common.contrast + "40"};
    background-color: ${({ theme }) => theme.palette.common.backgroundColor};
  }

  .followers-list {
    padding: ${convertPxToRem(15)} ${convertPxToRem(20)};
    .suggest-section {
      display: flex;
      justify-content: space-between;
    }
  }
`;

export const TopDiv = styled.div`
  .follow-btn {
    cursor: pointer;
  }
`;

export const Button = styled.button`
  margin-left: 0.625rem;
  // float: right;
  text-align: center;
  background: linear-gradient(90deg, #005bea -2.59%, #00c6fb 160.54%),
    linear-gradient(96.76deg, #ffa17f -44.56%, #00223e 189.36%), #c4c4c4;
  color: #ffffff;
  // font-family: Inter,sans-serif;
  font-weight: 700;
  flex-shrink: 0;
  // width: fit-content!important;
  height: 1.875rem;
  border-radius: 1.063rem;
  line-height: 0.938rem;
  color: #fff;
  padding: 0 1.063rem;
  font-size: 0.75rem;
  // width:10%;
  border: none;
  padding-left: 6rem;
  padding-right: 6rem;
`;
export const Para = styled.p``;
export const HeadDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 2.813rem;
  padding: 0 0.625rem;
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
export const ProfileDesc = styled.span`
  // font-family: Inter, sans-serif;
  font-size: 0.625rem;
  font-weight: 700;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: 0.3px;
  text-align: left;
  color: #5a5a63;
  display: block;
  margin-left: 0.813rem;
  width: 100%;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease-in;
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
  margin-bottom: 3px;
  width: 100%;
  display: flex;
  margin-left: 0.813rem;
`;
export const UserName = styled.span`
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease-in;
`;

export const UserDiv = styled.div`
  display: flex;
  flex-direction: column;
  // width: calc(100% - 2rem);
  width: max-content;
`;
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
export const FollowDiv = styled.div`
  padding-top: 0.5rem;
`;

// Unfollow;
export const Unfollow = styled.button`
  float: right;
  font-size: 0.75rem;
  padding: 0;
  border: 2px double transparent;
  border-radius: 5rem;

  background-image: linear-gradient(#fff, #fff),
    radial-gradient(circle at top left, #005bea, #00c6fb);
  color: #005bea;
  background-origin: border-box;
  background-clip: content-box, border-box;
  // font-family: Inter,sans-serif;
  font-weight: 500;
  flex-shrink: 0;
  height: 1.875rem;
  border-radius: 1.063rem;
`;
