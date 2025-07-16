import React, { useEffect, useState } from "react";
import AssetCardComponent from "../assetCardComponent/assetCardComponent";
import { Main, List } from "./style";
import { useSelector } from "react-redux";

function HomePage() {
  const [data, setData] = useState([]);
  const globalData = useSelector((state) => state.data.assets?.results);

  useEffect(() => {
    if (globalData?.length) {
      setData(globalData);
    }
  }, [globalData]);

  return (
    <>
      {data.length > 0 ? (
        <Main>
          <List>
            {data.map((value, i) => {
              return (
                <AssetCardComponent key={`${value?.id}-${i}`} data={value} />
              );
            })}
          </List>
        </Main>
      ) : (
        <Main width="150%"></Main>
      )}
    </>
  );
}

export default HomePage;
