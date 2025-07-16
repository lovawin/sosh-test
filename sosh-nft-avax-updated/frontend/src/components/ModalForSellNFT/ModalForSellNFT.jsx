import React, { useCallback, useEffect, useState } from "react";
import { StyledConfirmModal } from "components/confirmModal/style";
import ContentRenderer from "./ContentRenderer";
import { createSale, updateSale } from "common/helpers/nftMarketPlaceFunctions";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import {
  startLoginLoading,
  stopLoginLoading,
} from "store/loginStore/actionCreator";
import { getChainId } from "common/helpers/web3Helpers";
import { getConfigTime } from "services/userServices";
import { apiHandler } from "services/axios";
import { saleCreated, updateSaleCreated } from "services/assetsServices";
import { setLoading, unSetLoading } from "store/Actions/data";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";
import { contactInstance } from "common/methodInstance";
import formatTimestamp from "common/helpers/timerHelpers";
import marketplaceLogger from "services/marketplaceLogger";
import errorLogger from "services/errorLogger";

const ModalForSellNFT = ({
  showModal,
  handleClose,
  token_id,
  name,
  data,
  isEditPrice,
}) => {
  console.log("data from sher", data);
  const [selectedOption, setSelectedOption] = useState(null);
  const isUpdate = useSelector((state) => state.data.isUpdate);
  console.log("isUpdate", isUpdate);
  const [timeConfigData, setTimeConfigData] = useState();

  const handleModalClose = () => {
    handleClose();
    setStep("select");
  };

  const [step, setStep] = useState("select");
  const [formData, setFormData] = useState({
    askPrice: "",
    startTime: "",
    endTime: "",
    saleType: null,
  });
  console.log("formData", formData);

  useEffect(() => {
    if (isEditPrice) {
      setFormData({
        askPrice: ethers?.utils.formatEther(data?.askPrice),
        startTime: formatTimestamp(data?.startTime),
        endTime: formatTimestamp(data?.endTime),
      });
    }
  }, [data?.askPrice, data?.endTime, data?.startTime, isEditPrice]);
  const dispatch = useDispatch();
  const saleCreatedMutation = useCallback((data) => {
    console.log("data", data);
    apiHandler(() => saleCreated(data), {
      onSuccess: async (res) => {
        console.log("res from saleCreatedMuation", await res);
        // onLikeToggle && onLikeToggle(id);
      },
      onError: (error) => {
        console.log("error", error);
        toast("Error while creating sale", {
          position: "top-right",
          type: "error",
        });
      },
      final: () => {},
    });
  }, []);
  const updateSaleMutation = useCallback((data) => {
    console.log("data", data);
    apiHandler(() => updateSaleCreated(data), {
      onSuccess: async (res) => {
        console.log("res from saleCreatedMuation", await res);
        // onLikeToggle && onLikeToggle(id);
      },
      onError: (error) => {
        console.log("error", error);
        toast("Error while creating sale", {
          position: "top-right",
          type: "error",
        });
      },
      final: () => {},
    });
  }, []);

  const { address } = useSelector((state) => state.login);

  const getTimeConfigs = useCallback(() => {
    apiHandler(() => getConfigTime(), {
      onSuccess: (data) => {
        console.log("data from time config", data);
        setTimeConfigData(data);
      },
      onError: (error, response) => {
        console.log("error,response", error, response);
      },
      final: () => {},
    });
  }, []);
  useEffect(() => {
    getTimeConfigs();
  }, [getTimeConfigs]);

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? value : value,
    });
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setFormData({ ...formData, saleType: option });
  };

  const handleSale = async (formData) => {
    const { startTime, endTime } = formData;
    console.log("timeConfigData", timeConfigData);

    // Log time configuration data
    await marketplaceLogger.logTimeConfig(token_id, {
      minSaleDuration: timeConfigData?.minSaleDuration,
      maxSaleDuration: timeConfigData?.maxSaleDuration,
      minTimeDifference: timeConfigData?.minTimeDifference,
      extensionDuration: timeConfigData?.extensionDuration,
      minSaleUpdateDuration: timeConfigData?.minSaleUpdateDuration
    });

    const startTimestamp = new Date(startTime).getTime() / 1000;
    const endTimestamp = new Date(endTime).getTime() / 1000;
    const currentTime = Date.now() / 1000;

    const minTimeDifference = Number(timeConfigData?.minSaleDuration);
    
    // Validate start time
    if (startTimestamp < Math.floor(currentTime) + 60) {
      const errorMessage = "Start time must be at least 1 minute in the future";
      console.warn(errorMessage, {
        startTimestamp,
        currentTime,
        difference: startTimestamp - currentTime
      });
      
      // Log validation error
      await marketplaceLogger.logValidationError(token_id, 'START_TIME_TOO_SOON', {
        startTimestamp,
        currentTime,
        minRequired: Math.floor(currentTime) + 60,
        difference: startTimestamp - currentTime
      });
      
      toast.error(errorMessage);
      return;
    }

    // Validate duration
    if (endTimestamp - startTimestamp < minTimeDifference) {
      const errorMessage = `End time must be at least ${timeConfigData?.minTimeDifference} minutes after start time`;
      console.warn(errorMessage, {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        minRequired: minTimeDifference
      });
      
      // Log validation error
      await marketplaceLogger.logValidationError(token_id, 'DURATION_TOO_SHORT', {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        minRequired: minTimeDifference
      });
      
      toast.error(errorMessage);
      return;
    }

    const maxTimeDuration = Number(timeConfigData?.maxSaleDuration);

    // Validate max duration
    if (endTimestamp - startTimestamp > maxTimeDuration) {
      const errorMessage = "Maximum duration allowed is 20 days";
      console.warn(errorMessage, {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        maxAllowed: maxTimeDuration
      });
      
      // Log validation error
      await marketplaceLogger.logValidationError(token_id, 'DURATION_TOO_LONG', {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        maxAllowed: maxTimeDuration
      });
      
      toast.error(errorMessage);
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        startTime: startTimestamp,
        endTime: endTimestamp,
        tokenID: Number(token_id),
      };

      console.log("Preparing to create sale with data:", updatedFormData);

      // Log listing attempt with enhanced details
      await marketplaceLogger.logListingAttempt(
        token_id,
        {
          saleType: formData.saleType,
          price: formData.askPrice,
          startTime: startTimestamp,
          endTime: endTimestamp,
          userAddress: address,
          duration: endTimestamp - startTimestamp
        }
      );

      // Log contract call details
      await marketplaceLogger.logContractCall(
        token_id,
        'createSale',
        {
          saleType: formData.saleType,
          tokenID: Number(token_id),
          askPrice: formData.askPrice,
          startTime: startTimestamp,
          endTime: endTimestamp
        },
        { userAddress: address }
      );

      dispatch(setLoading());

      console.log("Calling createSale function...");
      let res = await createSale(updatedFormData, address);
      setStep("confirmation");
      console.log("Response from createSale:", res);
      console.log("Transaction hash:", res?.transactionHash);
      console.log("Sale ID:", res?.events?.SaleCreated?.returnValues?.saleId);
      
      // Extract sale ID from event
      const saleId = res?.events?.SaleCreated?.returnValues?.saleId || 'unknown';
      
      // Log listing success with enhanced details
      await marketplaceLogger.logListingResult(
        token_id,
        saleId,
        true,
        {
          transactionHash: res?.transactionHash,
          saleType: formData.saleType,
          price: formData.askPrice,
          gasUsed: res?.gasUsed,
          blockNumber: res?.blockNumber,
          events: JSON.stringify(res?.events)
        }
      );
      
      if (res?.transactionHash) {
        setFormData({
          askPrice: "",
          startTime: "",
          endTime: "",
          saleType: null,
        });
      }
      
      console.log("Calling saleCreatedMutation with transaction hash:", res?.transactionHash);
      saleCreatedMutation(res?.transactionHash);
      
      setTimeout(() => {
        handleModalClose();
        // Log UI update attempt
        marketplaceLogger.logEvent('UI_UPDATE_ATTEMPT', {
          tokenId: token_id,
          operation: 'LISTING',
          method: 'page_reload',
          timestamp: new Date().toISOString()
        });
        // Reload page to reflect the updated NFT listing state
        window.location.reload();
      }, 2000);
      
      dispatch(unSetLoading());
    } catch (error) {
      console.error("Error in handleSale function:", error);
      dispatch(unSetLoading());

      // Extract detailed error information
      const errorDetails = {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      };
      
      // If there's transaction data in the error, capture it
      if (error.transaction) {
        errorDetails.transaction = {
          from: error.transaction.from,
          to: error.transaction.to,
          data: error.transaction.data,
          gas: error.transaction.gas
        };
      }
      
      // If there's receipt data, capture it
      if (error.receipt) {
        errorDetails.receipt = {
          status: error.receipt.status,
          gasUsed: error.receipt.gasUsed,
          blockNumber: error.receipt.blockNumber,
          transactionHash: error.receipt.transactionHash
        };
      }
      
      console.error("Detailed error information:", errorDetails);

      // Log listing failure with enhanced details
      await marketplaceLogger.logListingResult(
        token_id,
        null,
        false,
        { 
          error: errorDetails,
          timestamp: new Date().toISOString()
        }
      );
      
      // Log transaction error with enhanced details
      await marketplaceLogger.logTransactionError(
        token_id,
        error,
        'LISTING',
        { 
          saleType: formData.saleType,
          price: formData.askPrice,
          userAddress: address,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      );
      
      // Also log to error logs with enhanced details
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'LISTING',
        context: {
          tokenId: token_id,
          saleType: formData.saleType,
          price: formData.askPrice,
          userAddress: address,
          operation: 'LISTING',
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      });

      toast.error(`Failed to create sale: ${error.message}`);
    }
  };

  const handleUpdateSale = async (formData) => {
    const { startTime, endTime } = formData;

    console.log("timeConfigData", timeConfigData);

    // Log time configuration data
    await marketplaceLogger.logTimeConfig(token_id, {
      minSaleDuration: timeConfigData?.minSaleDuration,
      maxSaleDuration: timeConfigData?.maxSaleDuration,
      minTimeDifference: timeConfigData?.minTimeDifference,
      extensionDuration: timeConfigData?.extensionDuration,
      minSaleUpdateDuration: timeConfigData?.minSaleUpdateDuration
    });

    const startTimestamp = new Date(startTime).getTime() / 1000;
    const endTimestamp = new Date(endTime).getTime() / 1000;
    const currentTime = Date.now() / 1000;
    const minTimeDifference = Number(timeConfigData?.minSaleDuration);
    
    // Validate start time
    if (startTimestamp < Math.floor(currentTime) + 60) {
      const errorMessage = "Start time must be at least 1 minute in the future";
      console.warn(errorMessage, {
        startTimestamp,
        currentTime,
        difference: startTimestamp - currentTime
      });
      
      // Log validation error
      await marketplaceLogger.logValidationError(token_id, 'START_TIME_TOO_SOON', {
        startTimestamp,
        currentTime,
        minRequired: Math.floor(currentTime) + 60,
        difference: startTimestamp - currentTime,
        operation: 'UPDATE'
      });
      
      toast.error(errorMessage);
      return;
    }

    // Validate duration
    if (endTimestamp - startTimestamp < minTimeDifference) {
      const errorMessage = `End time must be at least ${timeConfigData?.minTimeDifference} minutes after start time`;
      console.warn(errorMessage, {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        minRequired: minTimeDifference
      });
      
      // Log validation error
      await marketplaceLogger.logValidationError(token_id, 'DURATION_TOO_SHORT', {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        minRequired: minTimeDifference,
        operation: 'UPDATE'
      });
      
      toast.error(errorMessage);
      return;
    }

    const maxTimeDuration = Number(timeConfigData?.maxSaleDuration);

    // Validate max duration
    if (endTimestamp - startTimestamp > maxTimeDuration) {
      const errorMessage = "Maximum duration allowed is 20 days";
      console.warn(errorMessage, {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        maxAllowed: maxTimeDuration
      });
      
      // Log validation error
      await marketplaceLogger.logValidationError(token_id, 'DURATION_TOO_LONG', {
        startTimestamp,
        endTimestamp,
        duration: endTimestamp - startTimestamp,
        maxAllowed: maxTimeDuration,
        operation: 'UPDATE'
      });
      
      toast.error(errorMessage);
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        startTime: startTimestamp,
        endTime: endTimestamp,
        tokenID: Number(token_id),
      };

      console.log("Preparing to update sale with data:", updatedFormData);

      // Log listing update attempt with enhanced details
      await marketplaceLogger.logListingAttempt(
        token_id,
        {
          saleId: data?.saleId,
          operation: 'UPDATE',
          price: formData.askPrice,
          startTime: startTimestamp,
          endTime: endTimestamp,
          userAddress: address,
          duration: endTimestamp - startTimestamp,
          previousPrice: ethers?.utils.formatEther(data?.askPrice),
          previousStartTime: data?.startTime,
          previousEndTime: data?.endTime
        }
      );

      // Log contract call details
      await marketplaceLogger.logContractCall(
        token_id,
        'updateSale',
        {
          saleId: data?.saleId,
          askPrice: formData.askPrice,
          startTime: startTimestamp,
          endTime: endTimestamp
        },
        { 
          userAddress: address,
          operation: 'UPDATE'
        }
      );

      dispatch(setLoading());

      console.log("Calling updateSale function...");
      let res = await updateSale(data?.saleId, updatedFormData, address);
      setStep("confirmation");
      console.log("Response from updateSale:", res);
      console.log("Transaction hash:", res?.transactionHash);
      
      // Log listing update success with enhanced details
      await marketplaceLogger.logListingResult(
        token_id,
        data?.saleId,
        true,
        {
          operation: 'UPDATE',
          transactionHash: res?.transactionHash,
          price: formData.askPrice,
          gasUsed: res?.gasUsed,
          blockNumber: res?.blockNumber,
          events: JSON.stringify(res?.events),
          timestamp: new Date().toISOString()
        }
      );
      
      if (res?.transactionHash) {
        setFormData({
          askPrice: "",
          startTime: "",
          endTime: "",
          saleType: null,
        });
      }
      
      console.log("Calling saleCreatedMutation with transaction hash:", res?.transactionHash);
      saleCreatedMutation(res?.transactionHash);

      setTimeout(() => {
        handleModalClose();
        // Log UI update attempt
        marketplaceLogger.logEvent('UI_UPDATE_ATTEMPT', {
          tokenId: token_id,
          operation: 'UPDATE_LISTING',
          method: 'page_reload',
          timestamp: new Date().toISOString()
        });
        // Reload page to reflect the updated NFT listing state
        window.location.reload();
      }, 2000);
      
      dispatch(unSetLoading());
    } catch (error) {
      console.error("Error in handleUpdateSale function:", error);
      dispatch(unSetLoading());

      // Extract detailed error information
      const errorDetails = {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      };
      
      // If there's transaction data in the error, capture it
      if (error.transaction) {
        errorDetails.transaction = {
          from: error.transaction.from,
          to: error.transaction.to,
          data: error.transaction.data,
          gas: error.transaction.gas
        };
      }
      
      // If there's receipt data, capture it
      if (error.receipt) {
        errorDetails.receipt = {
          status: error.receipt.status,
          gasUsed: error.receipt.gasUsed,
          blockNumber: error.receipt.blockNumber,
          transactionHash: error.receipt.transactionHash
        };
      }
      
      console.error("Detailed error information:", errorDetails);

      // Log listing update failure with enhanced details
      await marketplaceLogger.logListingResult(
        token_id,
        data?.saleId,
        false,
        { 
          operation: 'UPDATE',
          error: errorDetails,
          timestamp: new Date().toISOString()
        }
      );
      
      // Log transaction error with enhanced details
      await marketplaceLogger.logTransactionError(
        token_id,
        error,
        'UPDATE_LISTING',
        { 
          saleId: data?.saleId,
          price: formData.askPrice,
          userAddress: address,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      );
      
      // Also log to error logs with enhanced details
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'UPDATE_LISTING',
        context: {
          tokenId: token_id,
          saleId: data?.saleId,
          price: formData.askPrice,
          userAddress: address,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      });

      toast.error(`Failed to update sale: ${error.message}`);
    }
  };

  return (
    <div>
      {isUpdate ? <LoadingBubbleCircle /> : ""}

      <StyledConfirmModal
        show={showModal}
        onHide={handleClose}
        title={step === "select" ? `Choose an Option for ${name}` : ""}
        showCloseButton={true}
        fillColor="blue"
        centered
      >
        <ContentRenderer
          name={name}
          step={step}
          selectedOption={selectedOption}
          formData={formData}
          handleInputChange={handleInputChange}
          setStep={setStep}
          setSelectedOption={setSelectedOption}
          handleClose={() => handleClose(setStep)}
          handleOptionChange={handleOptionChange}
          handleSale={handleSale}
          handleUpdateSale={handleUpdateSale}
          isUpdate={isUpdate}
          data={data}
          isEditPrice={isEditPrice}
        />
      </StyledConfirmModal>
    </div>
  );
};

export default ModalForSellNFT;
