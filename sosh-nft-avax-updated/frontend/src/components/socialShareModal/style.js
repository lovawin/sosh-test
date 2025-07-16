import { convertPxToRem } from "common/helpers";
import ModalWrapper from "components/modalWrapper";
import { deviceQuery } from "styles/mediaSizes";

const { default: styled } = require("styled-components");

export const StyledSocialShareModal = styled(ModalWrapper)`
  .modal-dialog {
    width: ${convertPxToRem(600)};

    .modal-content {
      .modal-body {
        .share-wrapper {
          width: 100%;
          padding: 0 ${convertPxToRem(15)};

          @media ${deviceQuery.tablet} {
            padding: 0 ${convertPxToRem(5)};
          }

          .share-item-list {
            display: flex;
            align-items: center;
            justify-content: center;

            flex-wrap: wrap;
            margin: 0 ${convertPxToRem(-10)} ${convertPxToRem(30)};

            .share-item-wrap {
              padding: ${convertPxToRem(5)} ${convertPxToRem(10)};
              .share-item {
                width: ${convertPxToRem(50)};
                height: ${convertPxToRem(50)};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2px;
                background-image: ${({
                  theme,
                }) => ` linear-gradient(${theme.palette.common.card.backgroundColor},${theme.palette.common.card.backgroundColor}),
                ${theme.palette.gradient.main}`};
                background-origin: border-box;
                background-clip: content-box, border-box;

                @media ${deviceQuery.tablet} {
                  width: ${convertPxToRem(40)};
                  height: ${convertPxToRem(40)};
                }

                .social-icon {
                  width: ${convertPxToRem(20)};
                  height: ${convertPxToRem(20)};

                  @media ${deviceQuery.tablet} {
                    width: ${convertPxToRem(18)};
                    height: ${convertPxToRem(18)};
                  }
                }
              }
            }
          }

          .link-area {
            display: flex;
            align-items: center;
            border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
            border: 1px solid
              ${({ theme }) => theme.palette.common.border.light};
            padding: ${convertPxToRem(20)} ${convertPxToRem(30)};
            margin: 0 auto ${convertPxToRem(30)};

            @media ${deviceQuery.tablet} {
              padding: ${convertPxToRem(15)} ${convertPxToRem(20)};
            }

            .link-wrap {
              flex-grow: 1;
              line-height: 150%;
              text-align: left;

              .label {
                color: ${({ theme }) => theme.palette.text.gray};
                margin-bottom: ${convertPxToRem(5)};
                text-transform: capitalize;
              }

              .link {
                margin-bottom: 0;
              }
            }

            .icon-wrap {
              margin-left: ${convertPxToRem(10)};
              cursor: pointer;

              .copy-icon {
                width: ${convertPxToRem(25)};
                height: ${convertPxToRem(25)};
              }
            }
          }
        }
      }
    }
  }
`;
