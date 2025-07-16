import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { InteractiveCardStyles } from "styles/commonStyles";
import { deviceQuery } from "styles/mediaSizes";

export const LIstItem = styled.li`
  list-style: none;
  position: relative;

  .asset-link {
    text-decoration: none;
    // position: absolute;
    // top: 0;
    // left: 0;
    // width: 100%;

    color: ${(props) => props.theme.palette.text.primary};
  }

  .follower-info-wrap {
    display: flex;
    align-items: center;
    margin-left: auto;
    flex-shrink: 0;

    .app-square-logo {
      width: ${convertPxToRem(20)};
      height: ${convertPxToRem(20)};
      margin-right: ${convertPxToRem(7)};
    }

    .follower-info {
      font-size: ${convertPxToRem(14)};
      line-height: 150%;
    }
  }

  .actions-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${convertPxToRem(10)};
    border-top: 1px solid ${(props) => props.theme.palette.common.border.light};
    color: ${(props) => props.theme.palette.text.gray};
    .action-wrapper {
      &:not(:first-child) {
        margin-left: ${convertPxToRem(5)};
      }

      .action-text {
        font-size: ${convertPxToRem(14)};
        line-height: 150%;
        margin-left: ${convertPxToRem(5)};
      }
    }

    .action-wrapper-upper {
      display: flex;
      justify-content: start;
    }

    .home-buy-button {
      height: 76%;
    }
  }
  .retrieve-container {
    display: flex;
    gap: 5px;
    flex-direction: column;
    .action-wrapper-upper {
      width: 100% !important;
      justify-content: space-between;
    }
    button {
      width: 100% !important;
    }
  }
`;

export const TopDiv = styled.div`
  width: ${convertPxToRem(400)};
  max-width: 100%;
  margin: auto;
  // background: #fff;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
  overflow: hidden;
  cursor: pointer;
  min-height: 27.875rem;
  transition: all 0.15s ease-out;
  height: 100%;

  .social-image {
    z-index: 1;
    width: 1.5rem;
    height: 1.5rem;
    position: absolute;
    top: ${convertPxToRem(12)};
    right: ${convertPxToRem(9)};
  }

  ${InteractiveCardStyles}

  .asset-image-container {
    padding: ${convertPxToRem(12)};
    .image-wrapper {
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
      overflow: hidden;
    }
  }

  .details-wrap {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: space-between;
    font-size: ${convertPxToRem(14)};

    .hash-tags-wrap {
      .hash-tag {
        &:hover {
          font-weight: 500;
        }
      }
    }
  }
`;
export const HeadDiv = styled.div`
  display: flex;

  justify-content: space-between;
  align-items: center;

  padding: 0 ${convertPxToRem(20)};
  margin-top: ${convertPxToRem(18)};
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
export const ProfileDiv = styled.div`
  //   display: flex;
  align-items: center;
  //   width: 60%;
`;
export const ProfileImg = styled.img`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  // width: 25px;
  border-radius: 50%;
  position: relative;
  background: ${(props) => props.img} no-repeat 50% / cover;
`;

export const UserName = styled.span`
  font-weight: 600;
  font-size: ${convertPxToRem(16)};
  line-height: 150%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(14)};
  }
`;

export const LogoImg = styled.img`
  width: 0.75rem;
  margin-right: 0.438rem;
  border-radius: 10px;
`;
export const HashTags = styled.span`
  display: flex;
  color: #4e575b;
  height: 1.375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
`;

export const PostImg1Div = styled.div``;
export const PostImg2Div = styled.div``;
export const PostImg = styled.img``;

export const LikeImg = styled.img`
  width: 0.75rem;
  margin-right: 0.188rem;
`;
export const ProImgDiv = styled.div`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
`;
export const ProfileDesc = styled.span`
  font-size: ${convertPxToRem(14)};
  line-height: 150%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(12)};
  }
`;

export const UserDiv = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: ${(props) => props.theme.palette.text.primary};
  margin-left: ${convertPxToRem(12)};
`;
export const MainDesc = styled.div`
  display: flex;
  align-items: center;
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
export const FollowerMain = styled.div`
  display: block;
  flex: 0 0 12.5%;
  max-width: 12.5%;
  position: relative;
  max-width: 100%;
  min-height: 1px;

  element.style {
    row-gap: 0px;
  }
  .AssetItem_menu_wrapper__mDDnr {
    text-align: end;
    justify-content: end;
    width: 100%;
  }
  .ant-row,
  .ant-row:after,
  .ant-row:before {
    display: flex;
  }
  .ant-row {
    flex-flow: row wrap;
  }
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
export const FollowerDiv1 = styled.div`
  // font-family: Inter, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #2c2a38;
  display: flex;
  flex-direction: column;
  width: 35%;
  align-items: flex-end;
`;
export const FollowerDiv2 = styled.div`
  display: flex;
  text-align: end;
  justify-content: end;
  width: 100%;
  row-gap: 0px;
  // font-family: Inter, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #2c2a38;
`;
export const FollowerNumber = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 100%;
  min-height: 1px;
  text-align: end;
  box-sizing: border-box;
  // font-family: Inter, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #2c2a38;
  list-style: none;
  font-feature-settings: normal;
  font-variant: normal;
`;
export const LogoDiv = styled.div`
  // font-family: Inter, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #2c2a38;
  height: 0.938rem;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
`;
export const LikeNO = styled.span`
  font-size: 0.813rem;
`;

export const AmountSpan = styled.span`
  font-family: Poppins;
  font-style: normal;

  // line-height: 2.813rem;
  display: flex;
  font-size: 1.5rem;
  margin-right: 4px;
  font-weight: bolder;
  background: -webkit-linear-gradient(#005bea, #00c6fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
export const PriceDiv = styled.div`
  font-family: Poppins;
  font-style: normal;
  font-weight: 500;
  font-size: 1.313rem;
  line-height: 1.938rem;
`;
export const AmountType = styled.span`
  font-family: Poppins;
  font-style: normal;
  font-weight: 500;
  font-size: 0.938rem;
  line-height: 2.5rem;
`;
