import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledHomePage = styled.div`
  display: flex;
  width: 100%;
  margin: ${convertPxToRem(30)} 0 ${convertPxToRem(50)};

  .filter-list-wrap {
    @media ${deviceQuery.tabletL} {
      display: none;
    }
  }

  .page-content-wrap {
    flex-grow: 1;
    margin-left: ${({ theme }) => theme.spacing.unit4};
    /* max-width: calc(
      100% - (${({ theme }) => theme.spacing.unit4} + ${convertPxToRem(300)})
    ); */

    @media ${deviceQuery.tabletL} {
      margin-left: 0;
      max-width: 100%;
    }

    .platform-filter-wrap {
      margin-bottom: ${convertPxToRem(30)};

      .platform-tags-wrapper {
        flex-grow: 1;
        margin-bottom: ${convertPxToRem(10)};
      }

      .tags-wrapper {
        margin-top: ${convertPxToRem(20)};
      }
      .custom-select {
        width: ${convertPxToRem(140)};
        .text-input-wrap {
          .dropdown-toggle {
            border-color: ${({ theme }) => theme.palette.common.gray};
            height: ${convertPxToRem(40)};
          }
        }
      }
    }

    .asset-list-wrap {
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};

      .cards-grid {
        overflow: visible !important;
      }
      .spin-loader {
        margin: ${convertPxToRem(30)} auto;
      }

      .coming-soon-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        margin-top: ${convertPxToRem(50)};
        min-height: ${convertPxToRem(300)};

        .message {
          font-size: ${convertPxToRem(20)};
          margin-bottom: ${convertPxToRem(20)};
          color: ${({ theme }) => theme.palette.text.gray};

          @media ${deviceQuery.tablet} {
            font-size: ${convertPxToRem(18)};
          }

          .main-text {
            font-size: ${convertPxToRem(30)};
            color: ${({ theme }) => theme.palette.text.primary};
            margin-bottom: ${convertPxToRem(10)};
            display: block;

            @media ${deviceQuery.tablet} {
              font-size: ${convertPxToRem(24)};
            }
          }
        }
        .sub-text {
          font-size: ${convertPxToRem(16)};
          color: ${({ theme }) => theme.palette.text.gray};
        }
      }
    }
  }

  .custom-pagination {
    display: flex;
    justify-content: center;
    gap: 10px;

    .page-item:active {
      page-link {
        background: red;
      }
    }
    .page-item.active .page-link {
      background: #0d6efd !important;
    }
    .page-link {
      border-radius: 20px !important;
      width: 36px;
      height: 36px;
      display: flex;
      justify-content: center;
      background: none !important;
    }
  }
`;
