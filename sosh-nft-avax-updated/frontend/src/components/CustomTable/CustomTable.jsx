import React, { useCallback, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { StyledCustomTable } from "./style";
import { apiHandler } from "services/axios";
import { getNftBid } from "services/assetsServices";
import { ethers } from "ethers";
import moment from "moment";

const CustomTable = ({
  data,
  tableTitle = "NFT_1 Biding Activity",
  headers,
  setAuctionData,
}) => {
  const [propData, setPropData] = useState(data);
  const [tabelData, setTableData] = useState([]);
  console.log("data from customTable", data);
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
            setTableData(data?.results);
            setAuctionData(data?.results);
          },
          final: () => {},
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setPropData(data);
  }, [data]);
  useEffect(() => {
    console.log("propData", propData);
    getUserPostList(propData);
  }, [getUserPostList, propData]);
  return (
    <>
      {propData?.subtype === "fixed" || !tabelData?.length > 0 ? null : (
        <StyledCustomTable>
          <div className="table-heading">
            <span>{`${data?.name} Biding Activity`}</span>
          </div>
          <Table
            className="transaction-table"
            striped
            borderless
            hover
            responsive
          >
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} style={header.style}>
                    {header.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabelData?.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontSize: 16, fontWeight: 600 }}>
                    {item?.user_id?.name}
                  </td>
                  <td>{ethers.utils.formatEther(item?.amount)}</td>
                  <td>{moment(item?.createdAt).format("MM-DD-YY")}</td>
                  <td>
                    <a
                      href={item.transactionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        window.open(
                          `https://sepolia.etherscan.io/tx/${item.txnHash}`,
                          "_blank"
                        );
                      }}
                    >
                      {`https://sepolia.etherscan.io/tx/${item.txnHash}`}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </StyledCustomTable>
      )}
    </>
  );
};

export default CustomTable;
