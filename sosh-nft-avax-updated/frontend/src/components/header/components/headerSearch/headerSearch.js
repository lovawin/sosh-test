import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyledPopover, StyledSearchWrap } from "./style";
import SearchIcon from "assets/icons/searchIcon";
import SearchTab from "components/searchTab/searchTab";
import { OverlayTrigger } from "react-bootstrap";
import { convertPxToRem } from "common/helpers";
import Portal from "components/portal";
import User2Icon from "assets/icons/user2Icon";
import TagIcon from "assets/icons/tagIcon";
import LocationIcon from "assets/icons/locationIcon";
import { useSelector } from "react-redux";
import { getSearchResults } from "services/searchServices";
import { apiHandler } from "services/axios";
import { debounce } from "lodash";

const popperConfig = {
  strategy: "fixed",
};

export const SEARCH_TABS_DATA = {
  user: {
    key: "users",
    title: "User",
    type: "user",
    icon: User2Icon,
  },
  tag: {
    key: "tags",
    title: "Tags",
    type: "asset",
    icon: TagIcon,
  },
  location: {
    key: "locations",
    title: "Location",
    type: "location",
    icon: LocationIcon,
  },
};

export const SEARCH_TABS_ARRAY = Object.values(SEARCH_TABS_DATA);
function HeaderSearch() {
  const [search, setSearch] = useState("");
  const [isOverlayVisible, setOverlayVisibility] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [dataKey, setDataKey] = useState("");
  const [activeTab, setActiveTab] = useState(SEARCH_TABS_DATA.user);
  const { userData } = useSelector((state) => state.user);
  const [isLoading, setLoading] = useState(false);

  const tabChangeHandler = (eventKey) => {
    const activeTab = SEARCH_TABS_ARRAY.find((item) => item?.key === eventKey);
    if (activeTab) {
      if (search && search !== "#") {
        search && startLoading();
      }
      setActiveTab(activeTab);
    }
  };

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const searchResults = useCallback(
    (_search, _type) => {
      if (_search.startsWith("#")) {
        _search = _search.replace("#", "");
      }
      if (_search !== "") {
        startLoading();
        apiHandler(() => getSearchResults(_search, _type), {
          onSuccess: ({ result }) => {
            if (_type === SEARCH_TABS_DATA?.user?.type) {
              result = result?.filter((item) => item?._id !== userData?._id);
            }
            setSearchData(result);
            setDataKey(_type);
          },
          onError: () => {
            setSearchData([]);
            setDataKey("");
          },
          final: () => {
            stopLoading();
          },
        });
      } else {
        setSearchData([]);
      }
    },
    [userData]
  );

  const debouncedSearch = useMemo(
    () => debounce(searchResults, 300),
    [searchResults]
  );

  useEffect(() => {
    debouncedSearch(search, activeTab?.type);
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch, search, activeTab?.type]);

  const showOverlay = () => {
    setOverlayVisibility(true);
  };

  const hideOverlay = useCallback(() => {
    setSearch("");
    setOverlayVisibility(false);
  }, []);

  const tabItemClickHandler = useCallback(() => {
    hideOverlay();
  }, [hideOverlay]);

  useEffect(() => {
    //hide scroll on overlay
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOverlayVisible]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search) {
      showOverlay();
    }
  }, [search, hideOverlay]);

  const inputFocusHandler = () => {
    if (search) {
      showOverlay();
    }
  };

  const renderSearchTab = ({ style, ...restProps }) => {
    return (
      <StyledPopover
        {...restProps}
        style={{
          ...style,
          backgroundColor: "transparent",
          paddingTop: convertPxToRem(30),
          border: "none",
        }}
      >
        <SearchTab
          search={search}
          onItemClick={tabItemClickHandler}
          onTabChange={tabChangeHandler}
          searchData={searchData}
          selectedTab={activeTab?.key}
          loading={isLoading}
          dataKey={dataKey}
        />
      </StyledPopover>
    );
  };

  return (
    <>
      <OverlayTrigger
        show={isOverlayVisible}
        placement="auto"
        overlay={renderSearchTab}
        popperConfig={popperConfig}
      >
        <StyledSearchWrap className="search-container">
          <div className="search-wrap">
            <SearchIcon />
            <input
              type="search"
              autoComplete="off"
              name="search"
              placeholder="Search..."
              onChange={handleSearch}
              value={search}
              className="search-input"
              onFocus={inputFocusHandler}
            />
          </div>
        </StyledSearchWrap>
      </OverlayTrigger>
      {isOverlayVisible && (
        <Portal fallbackOnBody>
          <div className="overlay-backdrop" onClick={hideOverlay}></div>
        </Portal>
      )}
    </>
  );
}

export default HeaderSearch;

HeaderSearch.propTypes = {};
