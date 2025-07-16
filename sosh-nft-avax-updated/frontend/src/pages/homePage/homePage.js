import React, { useCallback, useEffect, useState } from "react";
import SectionWrapper from "components/sectionWrapper";
import AssetList from "components/assetList/assetList";
import usePagination from "hooks/usePagination";
import { apiHandler } from "services/axios";
import { getAllPosts } from "services/assetsServices";
import PlatformFilter from "components/platformFilter/platformFilter";
import useFilters from "hooks/useFilters";
import useMediaQuery from "hooks/useMediaQuery";
import { deviceQuery } from "styles/mediaSizes";
import TagList from "components/tagList/tagList";
import { useDispatch, useSelector } from "react-redux";
import Banner from "components/Banner/Banner";
import AllFilterComponents from "components/AllFilterComponents/AllFilterComponents";
import { StyledHomePage } from "./styles";
import CustomPagination from "components/CustomPagination/CustomPagination";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";
import { StyledTabSwitcher } from "TabSwitcher/style";
import CustomButton from "components/CustomButton";

const FilterValues = [
  { label: "Trending", value: "trending" },
  { label: "Latest", value: "latest" },
  { label: "Earliest", value: "earliest" },
  { label: "Following", value: "following" },
];

function HomePage() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const isUpdate = useSelector((state) => state.data.isUpdate);
  console.log("isUpdate from homepage", isUpdate);
  useEffect(() => {
    console.log("isUpdate", isUpdate);
  }, [isUpdate]);

  const isLargeTablet = useMediaQuery(deviceQuery.tabletL);
  const { page, limit, total, setTotal, setPage } = usePagination();
  const { filters, changeFilter, isFilterChanged } = useFilters({
    sortBy: "",
    platform_type: null,
    search: null,
    tags: [],
    current: null,
    upcoming: null,
  });

  const dispatch = useDispatch();

  const getAllPostList = useCallback(() => {
    setLoading(true);
    apiHandler(
      () =>
        getAllPosts({
          page,
          limit,
          ...filters,
        }),
      {
        onSuccess: (data) => {
          const {
            pagination: { total: _total },
            results,
          } = data ?? {};
          setTotal(_total);
          console.log("results", results);
          setAssets(results);
        },
        onError: () => {
          setAssets([]);
        },
        final: () => {
          setLoading(false);
        },
      }
    );
  }, [page, limit, filters, setTotal]);

  useEffect(() => {
    getAllPostList();
  }, [page, filters, getAllPostList]);

  const filterBySelectFieldHandler = (updatedValue) => {
    changeFilter("sortBy", updatedValue);
    setPage(1);
  };
  const filterBySaleType = (updatedValue) => {
    console.log("updatedValue", updatedValue);
    if (updatedValue === 0) {
      changeFilter("current", true);
    } else if (updatedValue === 1) {
      changeFilter("upcoming", true);
    } else {
      changeFilter("upcoming", null);
      changeFilter("current", null);
    }

    setPage(1);
  };

  const tagChangeHandler = (updatedValue) => {
    changeFilter("platform_type", updatedValue?.value);
    setPage(1);
  };

  const nextPageHandler = (pageNumber) => {
    setPage(pageNumber);
  };

  const tagCloseHandler = useCallback(
    (tag) => {
      const _tags = filters?.tags?.filter((item) => item !== tag);
      changeFilter("tags", _tags);
    },
    [changeFilter, filters]
  );
  const refreshPosts = useCallback(() => {
    getAllPostList();
  }, [getAllPostList]);

  return (
    <>
      {isUpdate && <LoadingBubbleCircle />}
      <SectionWrapper>
        <Banner />
        <AllFilterComponents
          filters={filters}
          filterBySelectFieldHandler={filterBySelectFieldHandler}
          filterBySaleType={filterBySaleType}
        />

        <StyledHomePage>
          <div className="sub-section page-content-wrap">
            <div className="platform-filter-wrap">
              <PlatformFilter
                onSelect={tagChangeHandler}
                selected={filters?.platform_type}
              />
              <TagList tags={filters?.tags} onCancel={tagCloseHandler} />
            </div>

            <div className="asset-list-wrap">
              <AssetList
                refreshPosts={refreshPosts}
                data={assets}
                loading={loading && !assets?.length}
              />
              <CustomPagination
                total={total}
                limit={limit}
                page={page}
                onPageChange={nextPageHandler}
              />
            </div>
          </div>
        </StyledHomePage>
      </SectionWrapper>
    </>
  );
}

export default HomePage;
