import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { InteractiveCardStyles } from "styles/commonStyles";

export const StyledPostCard = styled.div`
  width: ${convertPxToRem(300)};
  max-width: 100%;
  //   height: 400px;
  display: flex;
  flex-direction: column;

  font-size: 14px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  overflow: hidden;
  //   padding: 1rem;

  .actions-container {
    position: relative;
    .edit-icon {
      right: 10px;
      top: -25px;
      position: absolute;
    }
  }

  ${InteractiveCardStyles}

  .post-image-wrapper {
    position: relative;
    .social-image {
      z-index: 1;
      width: 1.3rem;
      height: 1.3rem;
      position: absolute;
      top: ${convertPxToRem(12)};
      right: ${convertPxToRem(9)};
    }

    .post-link {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
    }
  }

  .details-container {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: ${convertPxToRem(10)} ${convertPxToRem(12)};
    text-align: left;
    .follow-button {
      width: 100%;
      margin-top: 10px;
    }

    .info-wrapper {
      line-height: 150%;
      min-width: 0;
      width: 100%;

      .name {
        font-size: ${convertPxToRem(16)};
        font-weight: 600;
        margin-bottom: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .desc {
        font-size: ${convertPxToRem(14)};
        margin-bottom: 0;
      }
    }

    .icon-wrap {
      width: ${convertPxToRem(30)};
      width: ${convertPxToRem(30)};
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-right: ${convertPxToRem(-10)};

      .menu-kebab-icon {
        width: ${convertPxToRem(5)};
      }
    }
  }

  .three-dot {
    cursor: pointer;
    margin-left: 10px;
  }
  .actions-container {
    display: flex;
    align-items: center;
    padding: ${convertPxToRem(10)};
    border-top: 1px solid ${(props) => props.theme.palette.common.border.light};
    color: ${(props) => props.theme.palette.text.gray};
    flex-wrap: wrap;
  }
  .edit-icon {
    cursor: pointer;
    margin-left: 10px;
  }
`;

export const MainImg = styled.div`
  // background-image: url(https://d1zjvcsgfckfe5.cloudfront.net/crypto/thumbnails/1630761617364-DSC-3669.jpg);
  background-image: url(${(props) => props.src});
  height: 9.5rem;
  width: 80;
  background-size: cover;
  background-position: center center;
  border-radius: 0.625rem 0.625rem 0px 0px;
  margin: 0.563rem;
`;
export const ProfileImg = styled.div`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  z-index: 1;
  overflow: visible;
  border-radius: 50%;
  position: relative;
  background: url(https://app.nafter.io/static/media/defaultAvatar.2bd8b1b6.svg)
    no-repeat 50% / cover;
`;
export const Button = styled.button`
  background: none;
  border-radius: 1.7rem;
  border: 1px solid #c0c0c0;
  height: 1.875rem;
  font-size: 0.75rem;
  margin-left: 0.625rem;
  // border-color: #c0c0c0;
`;
export const Desc = styled.span``;
