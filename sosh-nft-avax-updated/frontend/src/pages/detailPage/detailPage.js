import { useCallback, useEffect, useRef, useState } from "react";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";
import ImageCorousal from "../../components/corousalComponent/corousalComponent";
import DetailPageCard from "../../components/detailPageCard/detailPageCard";
import { useParams } from "react-router";
import { StyledAssetDetailPage } from "./style";
import { apiHandler } from "services/axios";
import { getAssetDetails } from "services/assetsServices";
import SectionWrapper from "components/sectionWrapper";
import { useSelector } from "react-redux";
import CustomTable from "components/CustomTable/CustomTable";

function DetailPage() {
  const [details, setDetails] = useState({});
  const [auctionData, setAuctionData] = useState([]);
  console.log("details", details);
  const { isLogin } = useSelector((state) => state.login);
  const { assets } = useSelector((state) => state.assets);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [assetNav, setAssetNav] = useState({
    prev: null,
    next: null,
  });

  const Params = useParams();
  const assetIdRef = useRef(null);

  useEffect(() => {
    if (details?._id) {
      const nav = {
        prev: null,
        next: null,
      };

      const index = assets?.findIndex((asset) => asset._id === details._id);
      if (index > 0) {
        nav.prev = assets[index - 1]?._id;
      }
      if (index < assets.length - 1) {
        nav.next = assets[index + 1]?._id;
      }
      setAssetNav(nav);
    }
  }, [details, assets]);

  const fetchAssetDetails = useCallback(() => {
    if (Params?.id !== assetIdRef.current) {
      setDetailsLoading(true);
    }

    apiHandler(
      () =>
        getAssetDetails(Params?.id, {
          page: 1,
          limit: 12,
        }),
      {
        onSuccess: (data) => {
          setDetails(data);
          assetIdRef.current = data?._id;
        },
        final: () => {
          setDetailsLoading(false);
        },
      }
    );
  }, [Params]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails, isLogin]);

  const dataTable = [
    {
      name: "Aron Simson",
      amount: "$25.00",
      time: "02.07.2020 11:11",
      transactionLink: "https://www.Transaction_link..",
    },
    {
      name: "Arica Jones",
      amount: "$25.00",
      time: "02.07.2020 11:11",
      transactionLink: "https://www.Transaction_link..",
    },
    {
      name: "Bruce",
      amount: "$25.00",
      time: "02.06.2020 11:11",
      transactionLink: "https://www.Transaction_link..",
    },
  ];

  const tableHeaders = [
    { displayName: "Name" },
    { displayName: "Amount" },
    { displayName: "Time", style: { width: "55%" } },
    { displayName: "Transaction Link" },
  ];

  return (
    <SectionWrapper>
      {details && !detailsLoading ? (
        <StyledAssetDetailPage>
          <div className="asset-image-wrap">
            <ImageCorousal src={details?.image} {...assetNav} />
          </div>

          <div className="asset-details-wrap">
            <DetailPageCard
              data={details}
              auctionData={auctionData}
              // onNextComments={getNextComments}
            />
          </div>
        </StyledAssetDetailPage>
      ) : (
        <LoadingBubbleCircle />
      )}

      <CustomTable
        setAuctionData={setAuctionData}
        data={details}
        headers={tableHeaders}
      />
    </SectionWrapper>
  );
}

export default DetailPage;
