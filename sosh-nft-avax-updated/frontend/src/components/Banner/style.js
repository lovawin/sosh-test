import styled from "styled-components";

export const StyledBanner = styled.div`
  max-width: 100%;
  height: 400px;
  background-image: url("/img/bannerImage1.png");
  background-size: 100% 100%;
  margin-top: 20px;
  border-radius: 15px;

  @media screen and (max-width:660px) {
  background-image: url("/img/mobile.png");


    
  }

  .main-container {
    max-width: 550px;
    padding-top: 96px;
    padding-left: 39px;
    p {
      font-size: 24px;
      font-weight: 600;
      line-height: 36px;
    }
  }
  .heading {
    font-size: 40px;
    font-weight: 800;
    line-height: 60px;
    text-align: left;
  }
  .countdown-container {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  .count-div {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 67.47px;
    height: 67.47px;
    border-radius: 15px;
    background: #080f1a;
    justify-content: center;
    .count-number {
      font-size: 24px;
      font-weight: 900;
      line-height: 24.48px;
      text-align: center;
      color: #ffffff;
      padding-top: 8px;
    }
    span {
      color: #a5deff;
    }
  }
`;