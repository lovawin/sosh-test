import { LIstItem, TopDiv, UserDiv, HeadDiv } from "./style";

import { convertPxToRem } from "common/helpers";
import AppSquareLogo from "assets/logos/appSquareLogo";

import React, { memo } from "react";
import ImageSkeleton from "components/skeletons/imageSkeleton";
import BoxSkeleton from "components/skeletons/boxSkeleton";
import TextSkeleton from "components/skeletons/textSkeleton";

function AssetCardSkeleton() {
  return (
    <>
      <LIstItem>
        <TopDiv $interactive={false}>
          <div className="asset-image-container">
            <ImageSkeleton aspectRatio={1.18} />
          </div>

          <HeadDiv>
            <BoxSkeleton
              width={convertPxToRem(45)}
              height={convertPxToRem(45)}
              radius={"50%"}
            />

            <UserDiv>
              <TextSkeleton type="title" />
              <br />
              <TextSkeleton />
            </UserDiv>
            <div className="follower-info-wrap">
              <AppSquareLogo />

              <span className="follower-info"> _ followers</span>
            </div>
          </HeadDiv>

          <div
            style={{
              marginTop: convertPxToRem(26),
              padding: `0 ${convertPxToRem(20)}`,
            }}
          >
            <TextSkeleton />
            <br />
            <TextSkeleton />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: `0 ${convertPxToRem(20)}`,
              margin: `${convertPxToRem(15)} 0`,
            }}
          >
            <TextSkeleton type="title" />
          </div>

          <div className="actions-container">
            <div className="action-wrapper">
              <TextSkeleton />
            </div>

            <div className="action-wrapper">
              <TextSkeleton />
            </div>
          </div>
        </TopDiv>
      </LIstItem>
    </>
  );
}

export default memo(AssetCardSkeleton);
