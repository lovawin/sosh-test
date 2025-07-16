import React from "react";
import {
  FormContainer,
  ConfirmationMessage,
  Input,
  Label,
  Option,
  OptionContainer,
  Icon,
} from "./style";
import CustomButton from "components/CustomButton";
import FixedPriceIcon from "assets/icons/fixedPriceIcon";
import AuctionPriceIcon from "assets/icons/auctionPriceIcon";
import PutOnSellDone from "assets/icons/putOnSellDone";
import TextInput from "components/formComponents/textInput";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";

const ContentRenderer = ({
  step,
  selectedOption,
  formData,
  handleInputChange,
  setStep,
  handleSale,
  handleUpdateSale,
  name,
  handleOptionChange,
  isUpdate,
  data,
  isEditPrice,
}) => {
  console.log("formData", formData);

  // Helper function to render the correct options
  const renderOptionContainer = () => {
    if (isEditPrice) {
      if (data?.type === "sale") {
        return (
          <OptionContainer>
            <Option
              onClick={() => handleOptionChange(1)}
              className={selectedOption === 1 ? "selected" : ""}
            >
              <Icon>
                <FixedPriceIcon />
              </Icon>
              Fixed Price
            </Option>
          </OptionContainer>
        );
      } else if (data?.type === "auction") {
        return (
          <OptionContainer>
            <Option
              onClick={() => handleOptionChange(0)}
              className={selectedOption === 0 ? "selected" : ""}
            >
              <Icon>
                <AuctionPriceIcon />
              </Icon>
              Auction
            </Option>
          </OptionContainer>
        );
      }
    }

    // Default options (both available)
    return (
      <OptionContainer>
        <Option
          onClick={() => handleOptionChange(1)}
          className={selectedOption === 1 ? "selected" : ""}
        >
          <Icon>
            <FixedPriceIcon />
          </Icon>
          Fixed Price
        </Option>
        <Option
          onClick={() => handleOptionChange(0)}
          className={selectedOption === 0 ? "selected" : ""}
        >
          <Icon>
            <AuctionPriceIcon />
          </Icon>
          Auction
        </Option>
      </OptionContainer>
    );
  };

  switch (step) {
    case "select":
      return (
        <>
          {isUpdate && <LoadingBubbleCircle />}
          {renderOptionContainer()}
          <CustomButton
            $width="100%"
            color="gradient"
            onClick={() => setStep("details")}
            disabled={selectedOption === null}
          >
            {isEditPrice ? "Edit" : "Proceed"}
          </CustomButton>
        </>
      );
    case "details":
      return (
        <>
          {isUpdate && <LoadingBubbleCircle />}
          <FormContainer>
            <h3>
              {selectedOption === 1
                ? `Fixed Price Details for ${name}`
                : `Auction Details for ${name}`}
            </h3>
            <Label>{selectedOption === 1 ? "Price" : "Base Price"}</Label>
            <TextInput
              type="number"
              name="askPrice"
              value={formData.askPrice}
              onChange={handleInputChange}
              placeholder="Enter the price"
            />
            <Label>Start Time (must be at least 1 minute from now)</Label>
            <TextInput
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
            />
            <Label>End Time (must be at least an hour from Start Time)</Label>
            <TextInput
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
            />
            <div className="form-btn">
              <CustomButton
                $width="100%"
                color="gradient"
                onClick={() =>
                  isEditPrice
                    ? handleUpdateSale(formData)
                    : handleSale(formData)
                }
                disabled={
                  !formData?.askPrice ||
                  !formData?.startTime ||
                  !formData?.endTime
                }
              >
                Confirm
              </CustomButton>
              <CustomButton
                color="gradient"
                outline
                $width="100%"
                onClick={() => setStep("select")}
              >
                Back
              </CustomButton>
            </div>
          </FormContainer>
        </>
      );
    case "confirmation":
      return (
        <>
          <ConfirmationMessage>
            <PutOnSellDone />
            <p>
              {isEditPrice
                ? `${name} has been updated`
                : `${name} has been put on sale`}
            </p>
          </ConfirmationMessage>
        </>
      );
    default:
      return null;
  }
};

export default ContentRenderer;
