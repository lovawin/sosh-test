import { useState, useEffect, useCallback } from 'react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  const handleMediaChange = useCallback(
    (e) => {
      if (e.matches) {
        setMatches(true);
      } else {
        setMatches(false);
      }
    },
    [setMatches]
  );

  useEffect(() => {
    if (!query) return () => {};
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.onchange = handleMediaChange;

    handleMediaChange(mediaQueryList);
    return () => {
      mediaQueryList.onchange = null;
    };
  }, [query, setMatches, handleMediaChange]);

  return matches;
};

export default useMediaQuery;
