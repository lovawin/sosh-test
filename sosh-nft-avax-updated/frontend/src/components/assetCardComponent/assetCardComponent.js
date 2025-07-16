import {
  LIstItem,
  AmountType,
  PriceDiv,
  AmountSpan,
  TopDiv,
  ProfileDesc,
  UserDiv,
  HeadDiv,
  UserName,
} from "./style";
import PropTypes from "prop-types";
import Routes from "constants/routes";
import { Link } from "react-router-dom";
import {
  getNftBid,
  likeAsset,
  purchaseNft,
  saleCreated,
} from "services/assetsServices";
import { apiHandler } from "services/axios";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Avatar from "components/Avatar/Avatar";
import { convertPxToRem } from "common/helpers";
import AppSquareLogo from "assets/logos/appSquareLogo";

import ShareButton from "components/shareButton/shareButton";
import LikeButton from "components/likeButton";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import EllipsedText from "components/EllipsedText";
import ImageComponent from "components/ImageComponent";
import { getCountBasedText } from "common/helpers/textHelpers";
import HashTag from "components/hashTag/hashTag";
import CustomButton from "components/CustomButton";
import ModalBuyNFT from "components/ModalPlaceBidNFT/ModalBuyNFT";
import { ethers } from "ethers";
import Web3 from "web3";
import {
  buyNFT,
  finalizeBid,
  retrieveBid,
} from "common/helpers/nftMarketPlaceFunctions";
import { setLoading, unSetLoading } from "store/Actions/data";
import CountdownTimer from "components/dynamicTimer/Timer";

function AssetCardComponent(props) {
  const { data: dataProp, isOwner, refreshPosts } = props;
  console.log("dataProp", dataProp);
  const [auctionData, setAssetAuctionData] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [isSaleDisabled, setIsSaleDisabled] = useState(false);
  const [isFinalize, setIsFinalized] = useState(false);
  const dispatch = useDispatch();
  const [data, setAssetData] = useState(dataProp);
  const { address } = useSelector((state) => state.login);

  const isLogin = useSelector((state) => state.login.isLogin);
  const [isLikeUpdating, setIsLikeUpdating] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const intervalRef = useRef();
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const purchaseNftMutation = useCallback((txHash) => {
    console.log("txHash", txHash);
    apiHandler(() => purchaseNft(txHash), {
      onSuccess: async (res) => {
        console.log("res from pruchase", await res);
        dispatch(unSetLoading());
        refreshPosts();
        window.location.reload();
        // onLikeToggle && onLikeToggle(id);
      },
      onError: (error) => {
        console.log("error", error);
        dispatch(unSetLoading());

        toast("Error while Buying", {
          position: "top-right",
          type: "error",
        });
      },
      final: () => {},
    });
  }, []);

  const handleProceed = async (saleId, price) => {
    try {
      dispatch(setLoading());

      let res = await buyNFT(saleId, price, address);
      console.log("res from buy handleProceed", res);

      if (res) {
        const txHash = {
          hash: res?.transactionHash,
        };
        purchaseNftMutation(txHash?.hash);
      }
    } catch (error) {
      console.error("Error:", error);
      dispatch(unSetLoading());
    }
  };

  useEffect(() => {
    setAssetData(dataProp);
  }, [dataProp]);

  const startLikeUpdate = () => {
    setIsLikeUpdating(true);
  };

  const stopLikeUpdate = () => {
    setIsLikeUpdating(false);
  };

  useEffect(() => {
    const start = new Date(data?.startTime * 1000).getTime();
    const end = new Date(data?.endTime * 1000).getTime();

    if (now < start) {
      console.log("saleDisabled now < start", now < start);
      setIsSaleDisabled(true);
    } else if (now > end) {
      console.log("saleDisabled now > end", now > end);
      setIsFinalized(true);
      setIsSaleDisabled(true);
      clearInterval(intervalRef.current);
    } else {
      console.log("saleDisabled changes", now > end);
      setIsSaleDisabled(false);
    }
  }, [data?.endTime, data?.startTime, now]);
  useEffect(() => {
    if (isFinalize) {
      clearInterval(intervalRef.current);
    }
  }, [isFinalize]);
  const likeAndDislikeAsset = (commentId) => {
    if (!isLogin) {
      toast("Please Connect Wallet", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return true;
    }
    startLikeUpdate();
    apiHandler(() => likeAsset(commentId, !data?.liked), {
      onSuccess: () => {
        setAssetData((prevState) => {
          return {
            ...prevState,
            liked: !prevState.liked,
            likedBy: !prevState.liked
              ? [...prevState.likedBy, userData]
              : prevState.likedBy.filter(({ _id }) => _id !== userData._id),
          };
        });
      },
      onError: () => {
        toast("Failed to like NFT", {
          position: "top-right",
          autoClose: 5000,
          type: "error",
        });
      },
      final: () => {
        stopLikeUpdate();
      },
    });
  };

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);

  const handleBuyClick = () => {
    if (!isLogin) {
      toast("Please Connect Wallet", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    setShowModal(true);
  };
  console.log(
    "data from assetCard",
    isOwner,
    data,
    data?.subtype,
    data?.askPrice,
    data?.askPrice ? ethers?.utils?.formatEther(data?.askPrice) : "0",
    Web3.utils.toWei(data?.askPrice ?? "1"),
    data?.totalBids,
    "data?.totalBids"
  );
  console.log("data?.subtype,", data?.subtype);
  const getUserPostList = useCallback(
    (data) => {
      apiHandler(
        () =>
          getNftBid({
            saleId: data?.saleId,
            asset_id: data?._id,
          }),
        {
          onSuccess: (data) => {
            console.log("data", data?.results);
            setAssetAuctionData(data?.results);
          },
          final: () => {},
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleFinalizeBid = async () => {
    try {
      console.log("works");
      dispatch(setLoading());

      let res = await finalizeBid(data?.saleId, address);
      if (res) {
        const txHash = {
          hash: res?.transactionHash,
        };
        console.log("txHash", txHash);
        purchaseNftMutation(txHash?.hash);
      }

      // onProceed(amount);
    } catch (error) {
      // setError("Transaction failed");

      console.error("Error:", error);
      dispatch(unSetLoading());
    }
  };
  const handleRetrieveAssets = async () => {
    try {
      console.log("works");
      dispatch(setLoading());

      let res = await retrieveBid(data?.saleId, address);
      if (res) {
        const txHash = {
          hash: res?.transactionHash,
        };
        console.log("txHash", txHash);
        purchaseNftMutation(txHash?.hash);
      }

      // onProceed(amount);
    } catch (error) {
      // setError("Transaction failed");
      console.error("Error:", error);
      dispatch(unSetLoading());
    }
  };

  useEffect(() => {
    getUserPostList(data);
  }, [data, getUserPostList]);
  return (
    <>
      <LIstItem>
        <TopDiv>
          <Link className="asset-link" to={`${Routes.nftDetail}/${data._id}`}>
            {" "}
            <div className="asset-image-container">
              <ImageComponent
                src={data?.image}
                alt={data?.name}
                aspectRatio={1.18}
              />

              <img
                alt={data?.platform_type}
                className="social-image"
                src={`/img/${data?.platform_type?.toLowerCase()}.svg`}
              />
            </div>
          </Link>
          <Link
            className="asset-link"
            to={`/user-profile/${data?.owner_id?._id}`}
          >
            <HeadDiv>
              <Avatar
                $width={convertPxToRem(45)}
                $height={convertPxToRem(45)}
                $imgURL={data?.owner_id?.profile_image_url}
              />

              <UserDiv>
                <UserName>{data?.owner_id?.name}</UserName>
                <ProfileDesc> @{data?.owner_id?.username}</ProfileDesc>
              </UserDiv>
              <div className="follower-info-wrap">
                <AppSquareLogo />

                <span className="follower-info">
                  {getCountBasedText(
                    data?.owner_id?.followers.length,
                    "Follower",
                    true
                  )}
                </span>
              </div>
            </HeadDiv>
          </Link>
          <Link
            className="asset-link details-wrap"
            to={`${Routes.nftDetail}/${data._id}`}
          >
            {" "}
            <div
              style={{
                marginTop: convertPxToRem(15),
                padding: `0 ${convertPxToRem(20)}`,
              }}
            >
              <div>
                <span>
                  {data?.name?.length > 30 ? (
                    <> {data?.name.substr(0, 30)}....</>
                  ) : (
                    <>{data?.name}</>
                  )}
                </span>
              </div>
              <div className="hash-tags-wrap">
                <HashTag tag={data?.hashtag} />{" "}
              </div>
              <div>
                <EllipsedText text={data?.description} maxLength={30} />
                <CountdownTimer
                  startTime={Number(data?.startTime)}
                  endTime={Number(data?.endTime)}
                />

                {/* <span style={{ fontSize: "15px", color: "#00C6FB" }}>
                Multipal{" "}
                </span>
                <span style={{ fontSize: "15px", fontWeight: "600" }}>
                  copies|owners
                </span> */}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: `0 ${convertPxToRem(20)}`,
                marginTop: convertPxToRem(15),
              }}
            >
              {" "}
              <PriceDiv>{data?.subtype}</PriceDiv>
              <div style={{ display: "flex" }}>
                <AmountSpan>
                  {data?.askPrice
                    ? ethers?.utils?.formatEther(data?.askPrice)
                    : "0"}
                  {/* <Span>128</Span> */}
                </AmountSpan>
                <AmountType>AVAX</AmountType>
              </div>
            </div>
          </Link>
          <div
            className={`actions-container ${
              data?.totalBids === 0 && isFinalize && "retrieve-container"
            }`}
          >
            <div className="action-wrapper-upper">
              <div className="action-wrapper">
                <ShareButton
                  text={data.name}
                  longText={data.description}
                  link={`${window?.location?.origin}${Routes.nftDetail}/${data._id}`}
                />
              </div>

              <div className="action-wrapper">
                <LikeButton
                  loading={isLikeUpdating}
                  isLiked={data?.liked}
                  disabled={isLikeUpdating}
                  count={data?.likedBy?.length}
                  onClick={() => likeAndDislikeAsset(data._id)}
                />
              </div>
            </div>
            {isFinalize &&
            data?.type === "sale" &&
            data?.totalBids === 0 &&
            isOwner ? (
              <CustomButton
                className="home-buy-button"
                $width="auto"
                color="gradient"
                onClick={() => handleRetrieveAssets()}
                // disabled={isLikeUpdating || isSaleDisabled}
              >
                Retreive Assets
              </CustomButton>
            ) : !isFinalize && data?.subtype ? (
              data?.subtype === "fixed" ? (
                <CustomButton
                  className="home-buy-button"
                  $width="27%"
                  color="gradient"
                  onClick={() => {
                    handleProceed(data?.saleId, data?.askPrice);
                  }}
                  disabled={isLikeUpdating || isSaleDisabled}
                >
                  Buy
                </CustomButton>
              ) : !isFinalize ? (
                <CustomButton
                  className="home-buy-button"
                  $width="27%"
                  color="gradient"
                  onClick={handleBuyClick}
                  disabled={isLikeUpdating || isSaleDisabled}
                >
                  Bid
                </CustomButton>
              ) : (
                <CustomButton
                  className="home-buy-button"
                  $width="27%"
                  color="gradient"
                  onClick={handleFinalizeBid}
                  // disabled={isLikeUpdating || isSaleDisabled}
                >
                  Finalize
                </CustomButton>
              )
            ) : null}
          </div>
        </TopDiv>

        {/* {linkable && (
          <Link
            className="asset-link"
            to={`${Routes.nftDetail}/${data._id}`}
          ></Link>
        )} */}
      </LIstItem>

      <ModalBuyNFT
        actionType={data?.subtype === "fixed" ? "buy" : "bid"}
        auctionData={auctionData}
        showModal={showModal}
        handleClose={handleClose}
        saleId={data?.saleId}
        setShowModal={setShowModal}
        askPrice={
          data?.askPrice ? ethers?.utils?.formatEther(data?.askPrice) : 0
        }
      />
    </>
  );
}

export default memo(AssetCardComponent);
AssetCardComponent.propTypes = {
  linkable: PropTypes.bool,
  onLikeToggle: PropTypes.func,
};
