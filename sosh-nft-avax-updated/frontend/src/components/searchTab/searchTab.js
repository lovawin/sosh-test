import React from "react";
import propTypes from "prop-types";

import { Main, Container } from "./style";
import HashTag from "./components/hashTag/hashTag";
import { useNavigate } from "react-router";
import Routes from "constants/routes";
import { Nav, Tab } from "react-bootstrap";
import UserListItem from "./components/userListItem/userListItem";
import {
  SEARCH_TABS_ARRAY,
  SEARCH_TABS_DATA,
} from "components/header/components/headerSearch/headerSearch";
import MiniLoader from "components/miniLoader";

function SearchTab({
  onItemClick,
  searchData,
  selectedTab,
  onTabChange,
  loading = false,
  dataKey,
  ...restProps
}) {
  const navigate = useNavigate();

  const onHashTagClick = (hashtag) => {
    onItemClick &&
      onItemClick({
        type: "hashtag",
        value: hashtag?.slice(1),
      });
    navigate({
      pathname: Routes.home,
      search: `?tags=${hashtag?.slice(1)}`,
    });
  };

  const onUserClick = (userId) => {
    onItemClick && onItemClick({ type: "user", value: userId });
    navigate({
      pathname: `${Routes.userProfile}/${userId}`,
    });
  };

  const tabChangeHandler = (eventKey) => {
    onTabChange && onTabChange(eventKey);
  };

  return (
    <Main {...restProps}>
      <Container>
        <Tab.Container
          defaultActiveKey={selectedTab || SEARCH_TABS_DATA?.user.key}
          onSelect={tabChangeHandler}
        >
          <Nav className="tab-list">
            {SEARCH_TABS_ARRAY?.map(({ title, key, type, icon: Icon }) => {
              return (
                <Nav.Item className="tab-item">
                  <Nav.Link className="tab-link" eventKey={key}>
                    {title} {Icon && <Icon />}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey={SEARCH_TABS_DATA.user.key}>
              <div className="data-list">
                {loading ? (
                  <MiniLoader
                    containerClassName="data-loader"
                    label="Loading results..."
                    className="spinner"
                  />
                ) : !searchData ||
                  searchData?.length === 0 ||
                  dataKey !== SEARCH_TABS_DATA.user.type ? (
                  <div className="no-data">No matching user found</div>
                ) : (
                  searchData?.map((value, i) => {
                    return (
                      <div
                        onClick={() => onUserClick(value?._id)}
                        className="data-list-item"
                      >
                        <UserListItem {...value} />
                      </div>
                    );
                  })
                )}
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey={SEARCH_TABS_DATA.tag.key}>
              <div className="data-list ">
                {loading ? (
                  <MiniLoader
                    containerClassName="data-loader"
                    label="Loading results..."
                    className="spinner"
                  />
                ) : !searchData ||
                  searchData?.length === 0 ||
                  dataKey !== SEARCH_TABS_DATA.tag.type ? (
                  <div className="no-data">No matching tag found</div>
                ) : (
                  searchData?.map(({ hashtag, postCount }, i) => {
                    return (
                      <div
                        className="data-list-item"
                        onClick={() => onHashTagClick(hashtag)}
                        key={`${hashtag}-${i}`}
                      >
                        <HashTag
                          tag={{ name: hashtag, postCount: postCount }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey={SEARCH_TABS_DATA.location.key}>
              <div className="data-list ">
                <div className="no-data">No matching location found</div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </Main>
  );
}

export default SearchTab;

SearchTab.propTypes = {
  data: propTypes.array,
  onItemClick: propTypes.func,
  onTabChange: propTypes.func,
  searchData: propTypes.arrayOf(propTypes.object),
  selectedTab: propTypes.string,
  loading: propTypes.bool,
  dataKey: propTypes.string,
};
