import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledAssetDetailPage = styled.div`
  display: flex;
  width: 100%;
  a {
    text-decoration: none;
    color: ${({ theme }) => theme.palette.text.primary};
    &:hover {
      color: ${({ theme }) => theme.palette.text.secondary};
    }
  }
  margin: ${convertPxToRem(70)} 0 ${convertPxToRem(90)};
  flex-wrap: wrap;

  @media ${deviceQuery.tablet} {
    margin: ${convertPxToRem(40)} 0 ${convertPxToRem(70)};
  }

  .asset-image-wrap {
    width: calc(100% / 3 * 2);
    max-width: 100%;
    padding-right: ${convertPxToRem(30)};

    @media ${deviceQuery.tabletL} {
      width: 100%;
      padding-right: 0;
    }
  }
  .asset-details-wrap {
    width: calc(100% / 3);
    max-width: 100%;

    @media ${deviceQuery.tabletL} {
      width: 100%;
      margin-top: ${convertPxToRem(20)};
    }
  }
`;
