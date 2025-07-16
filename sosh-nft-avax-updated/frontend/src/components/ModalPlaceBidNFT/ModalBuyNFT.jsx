import React, { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "components/CustomButton";
import { StyledConfirmModal } from "components/confirmModal/style";
import TextInput from "components/formComponents/textInput";
import { buyNFT, placeBidNFT } from "common/helpers/nftMarketPlaceFunctions";
import { placeBid, purchaseNft } from "services/assetsServices";
import { apiHandler } from "services/axios";
import { toast } from "react-toastify";
import { setLoading, unSetLoading } from "store/Actions/data";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";

const ModalBuyNFT = ({
  showModal,
  handleClose,
  onProceed,
  actionType,
  setShowModal,
  saleId,
  askPrice,
  auctionData,
}) => {
  const [amount, setAmount] = useState("");
  const isUpdate = useSelector((state) => state.data.isUpdate);
  console.log("askPrice", typeof askPrice);

  const dispatch = useDispatch();
  console.log("saleId from ModalNft", saleId);
  const [error, setError] = useState("");
  const purchaseNftMutation = useCallback((data) => {
    console.log("data", data);
    apiHandler(() => purchaseNft(data), {
      onSuccess: async (res) => {
        dispatch(unSetLoading());
        setShowModal(false);

        console.log("res from purchaseNftMutation", await res);
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

  const placeBidMutation = useCallback((txHash) => {
    console.log("txHash from placeBidMutation", txHash);
    apiHandler(() => placeBid(txHash), {
      onSuccess: async (res) => {
        console.log("res from pruchase", await res);
        dispatch(unSetLoading());
        setShowModal(false);
        // onLikeToggle && onLikeToggle(id);
      },
      onError: (error) => {
        console.log("error", error);
        dispatch(unSetLoading());

        toast("Error while placing", {
          position: "top-right",
          type: "error",
        });
      },
      final: () => {},
    });
  }, []);
  const { address } = useSelector((state) => state.login);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (
        parseFloat(value) <= parseFloat(askPrice) &&
        auctionData?.length > 0
      ) {
        setError(`Amount should be greater than  ${askPrice}`);
      } else {
        setError("");
      }
    } else {
      setError("Please enter a valid number");
    }
  };
  const handleProceed = async () => {
    if (!amount || isNaN(amount)) {
      setError("Please enter a valid number");
      return;
    }
    try {
      console.log("actionType", actionType);
      if (actionType === "buy") {
        console.log("works");
        dispatch(setLoading());

        let res = await buyNFT(saleId, amount, address);
        if (res) {
          purchaseNftMutation(res?.transactionHash);
        }
      } else if (actionType === "bid") {
        console.log("works from bid");
        try {
          dispatch(setLoading());

          let res = await placeBidNFT(saleId, amount, address);

          // placeBidMutation();
          const txHash = {
            hash: res?.transactionHash,
          };
          console.log("txHash before placing bid", txHash);

          placeBidMutation(txHash);
        } catch (error) {
          console.log("error from placebid ", error);
          dispatch(unSetLoading());
        }
      }
      // onProceed(amount);
    } catch (error) {
      // setError("Transaction failed");
      console.error("Error:", error);
      dispatch(unSetLoading());
    }
  };

  return (
    <StyledConfirmModal
      show={showModal}
      onHide={handleClose}
      title={
        actionType === "buy"
          ? "Enter the amount to buy NFT"
          : "Enter your bid amount"
      }
      showCloseButton={true}
      fillColor="blue"
      centered
    >
      {isUpdate && <LoadingBubbleCircle />}
      <Form autoComplete="off">
        <Form.Group controlId="amount">
          <TextInput
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder={
              actionType === "buy"
                ? "Enter the amount to buy NFT"
                : "Enter your bid amount"
            }
            isInvalid={!!error}
          />
          {error && <Form.Text style={{ color: "red" }}>{error}</Form.Text>}
        </Form.Group>
        <>
          <CustomButton
            color="gradient"
            style={{ marginTop: 50 }}
            onClick={handleProceed}
            disabled={!amount || !!error}
          >
            {actionType === "buy" ? "Proceed to Buy " : "Proceed to Bid"}
          </CustomButton>
        </>
      </Form>
    </StyledConfirmModal>
  );
};

export default ModalBuyNFT;
