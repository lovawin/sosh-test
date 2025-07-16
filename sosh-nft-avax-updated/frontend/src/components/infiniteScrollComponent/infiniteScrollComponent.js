import React, { useEffect } from "react";
import PropTypes from "prop-types";

import InfiniteScroll from "react-infinite-scroll-component";

const InfiniteScrollComponent = ({
  children,
  scrollableTarget,
  hasMore,
  next,
  loading,
  ...restProps
}) => {
  useEffect(() => {
    const root = scrollableTarget || document.documentElement;
    if (!loading && hasMore && next && root.scrollHeight <= root.clientHeight) {
      next();
    }
  }, [loading, next, scrollableTarget, hasMore]);

  return (
    <InfiniteScroll
      next={next}
      hasMore={hasMore}
      scrollableTarget={scrollableTarget}
      {...restProps}
    >
      {children}
    </InfiniteScroll>
  );
};

InfiniteScrollComponent.propTypes = {
  children: PropTypes.node,
  scrollableTarget: PropTypes.node,
  hasMore: PropTypes.bool,
  next: PropTypes.func,
  loading: PropTypes.bool,
  ...InfiniteScroll.propTypes,
};

export default InfiniteScrollComponent;
