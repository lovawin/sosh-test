import React from "react";
import PropTypes from "prop-types";
import AssetCardComponent from "../assetCardComponent/assetCardComponent";
import { StyledAssetListWrapper, StyledAssetList } from "./style";
import { range } from "lodash";
import AssetCardSkeleton from "components/assetCardComponent/assetCardSkeleton";
import EmptyData from "components/emptyData/emptyData";
import { useNavigate } from "react-router";
import Routes from "constants/routes";
import { useSelector } from "react-redux";

const loadingAssets = range(6);
function AssetList({ data = [], loading, refreshPosts, ...restProps }) {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  return (
    <StyledAssetListWrapper>
      <StyledAssetList>
        {loading
          ? loadingAssets?.map((_, i) => {
              return <AssetCardSkeleton key={i} />;
            })
          : data.length > 0
          ? data?.map((value, i) => {
              const isOwner = userData?._id === value?.owner_id?._id;
              return (
                <AssetCardComponent
                  refreshPosts={refreshPosts}
                  key={`${value?.id}-${i}`}
                  isOwner={isOwner}
                  data={value}
                  {...restProps}
                />
              );
            })
          : null}
      </StyledAssetList>
      {!loading && !data?.length === 0 && (
        <EmptyData
          message="No NFT found, You can add one by clicking on the button below."
          actionLabel="Create NFT"
          action={() => navigate(Routes.createNFT)}
        />
      )}
    </StyledAssetListWrapper>
  );
}

export default AssetList;

AssetList.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
