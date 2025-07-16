import { checkIfLogin } from "common/common";
import InfiniteScrollComponent from "components/infiniteScrollComponent";
import MiniLoader from "components/miniLoader";
import ProfileDetailsCard from "components/myProfileComponents/profileDetailsCard/profileDetailsCard";
import PostList from "components/postList/postList";
import SectionWrapper from "components/sectionWrapper";
import useFilters from "hooks/useFilters";
import usePagination from "hooks/usePagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { getAssetsByOwner, getSuggestAccount } from "services/assetsServices";
import { apiHandler } from "services/axios";
import { getUserById } from "services/userServices";

import { StyledProfilePage } from "./style";
import TabSwitcher from "TabSwitcher/TabSwitcher";
import FilterFixedAndAuction from "components/AllFilterComponents/FIlterFixedAndAuction";
import { filter } from "lodash";

function MyProfile() {
  const [sugesstedAcc, setSuggestAcc] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const userData = useSelector((state) => state.user.userData);
  const { page, limit, total, setTotal, setPage } = usePagination();
  const { filters, changeFilter, isFilterChanged } = useFilters({
    sale: null,
    sold: null,
    owner: null,
    type: null,
    fixed: null,
    auction: null,
  });

  const [hasMore, setHasMore] = useState(false);
  const [isFilterChange, setIsFilterChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userAssets, setUserAssets] = useState([]);
  const { _id: user_id } = userData || {};
  const Params = useParams();
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState({});
  const myProfileFilter = useCallback(
    (updatedValue) => {
      console.log("updatedValue from profile", updatedValue);
      if (updatedValue === 0) {
        changeFilter("owner", true);
      } else if (updatedValue === 1) {
        changeFilter("sale", true);
      } else if (updatedValue === 2) {
        changeFilter("sold", true);
      } else {
        changeFilter("owner", null);
        changeFilter("sale", null);
        changeFilter("sold", null);
      }

      setPage(1);
    },
    [changeFilter, setPage]
  );

  useEffect(() => {
    myProfileFilter(0);
  }, []);
  useEffect(() => {
    if (filters.sale && !filters.type) {
      // Check if "sale" is selected and "type" is not set yet
      changeFilter("type", "fixed"); // Set "type" to "fixed" by default
    }
  }, [changeFilter, filters.sale, filters.type]); // Run on changes to filters.sale

  const saleType = (updatedValue) => {
    if (updatedValue === "fixed") {
      changeFilter("type", "fixed");
    } else if (updatedValue === "auction") {
      changeFilter("type", "auction");
    }
  };

  const isLoggedInProfile = useMemo(() => {
    if (checkIfLogin()) {
      return profileData?._id === userData?._id;
    }
    return false;
  }, [userData, profileData]);

  useEffect(() => {
    const _userId = Params.id || user_id;

    if (_userId) {
      setUserId(_userId);
      apiHandler(
        () => {
          return getUserById(_userId);
        },
        {
          onSuccess: (data) => {
            setProfileData({ ...data, referralCode: "SOSH50" });
          },
        }
      );
    }
  }, [Params, user_id]);

  useEffect(() => {
    setHasMore(userAssets?.length < total);
  }, [total, userAssets]);
  //

  const getUserPostList = useCallback(
    ({ page: _page = 1, limit: _limit = limit } = {}) => {
      if (userId) {
        setLoading(true);
        apiHandler(
          () =>
            getAssetsByOwner(userId, {
              page: _page,
              limit: _limit,
              ...filters,
            }),
          {
            onSuccess: (data) => {
              const {
                pagination: { total: _total },
                results,
              } = data ?? {};
              setTotal(_total);
              setPage(_page);

              if (_page === 1) {
                setUserAssets(results);
              } else {
                setUserAssets((prev) => {
                  return [...prev, ...results];
                });
              }
            },
            final: () => {
              setLoading(false);
            },
          }
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, filters, userId]
  );

  useEffect(() => {
    if (filters?.owner) {
      setIsFilterChanged(true);
      getUserPostList();
    }
  }, [filters, getUserPostList]);

  useEffect(() => {
    if (isFilterChange) {
      getUserPostList();
    }
  }, [getUserPostList, isFilterChange]);

  useEffect(() => {
    apiHandler(
      () => {
        return getSuggestAccount();
      },
      {
        onSuccess: (data) => {
          setSuggestAcc(data);
        },
      }
    );
  }, []);

  const nextPageHandler = useCallback(() => {
    getUserPostList({ page: page + 1 });
  }, [getUserPostList, page]);

  const postDeleteHandler = useCallback(
    (postId) => {
      setUserAssets((prev) => {
        return prev.filter((post) => post._id !== postId);
      });
      setProfileData((prev) => ({
        ...prev,
        userAsset: prev?.userAsset - 1,
      }));
      setTotal((prev) => prev - 1);
    },
    [setTotal]
  );

  const tabs = [{ name: "Owned" }, { name: "On sale" }, { name: "Sold" }];

  return (
    <>
      {userId ? (
        <SectionWrapper>
          <StyledProfilePage>
            <div className="user-data-wrap">
              <ProfileDetailsCard
                profileData={profileData}
                sugesstedAcc={sugesstedAcc}
                isLoggedInProfile={isLoggedInProfile}
              />
            </div>

            <div className="post-list-wrap">
              {isLoggedInProfile && (
                <div style={{ marginBottom: "30px" }}>
                  <TabSwitcher
                    setCurrentTab={setCurrentIndex}
                    from={"myProfile"}
                    tabs={tabs}
                    myProfileFilter={myProfileFilter}
                    initial={0}
                  />
                  {currentIndex === 1 && (
                    <FilterFixedAndAuction saleType={saleType} initial={null} />
                  )}
                </div>
              )}
              <InfiniteScrollComponent
                next={nextPageHandler}
                dataLength={userAssets?.length}
                className="cards-grid"
                loader={
                  <MiniLoader
                    containerClassName="spin-loader"
                    label="Loading..."
                  />
                }
                hasMore={hasMore}
                loading={loading}
                scrollThreshold={0.8}
              >
                <PostList
                  isLoggedInProfile={isLoggedInProfile}
                  data={userAssets}
                  loading={loading && !userAssets?.length}
                  filter={filters}
                  onPostDelete={postDeleteHandler}
                />
              </InfiniteScrollComponent>
            </div>
          </StyledProfilePage>
        </SectionWrapper>
      ) : (
        <LoadingBubbleCircle />
      )}
    </>
  );
}

export default MyProfile;
