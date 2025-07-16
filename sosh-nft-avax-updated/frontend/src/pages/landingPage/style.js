import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  .top-container {
    display: flex;
    justify-content: space-around;
    padding: 80px 0;

    @media ${deviceQuery.tabletL} {
      flex-direction: column;
      padding: 60px 0;

      &.reverse {
        flex-direction: column-reverse;
      }
    }
    @media ${deviceQuery.mobile} {
      padding: 50px 0;
    }
  }

  element.style {
  }
  a {
    color: none;
    text-decoration: none;
  }

  #title {
    font-style: normal;
    font-weight: 60;
    font-size: 30px;
    line-height: 45px;

    // color: #2b2c2d;
  }
  #logo {
    margin-top: 12rem;
    margin-left: 200px;
    position: relative;
    // animation: mymove 2s linear;
    // animation-timing-function: ease;
  }

  #step {
    background: #fff;
    width: 12rem;
    height: 12rem;
    border-radius: 1rem;
    text-aligns: center;
    align-items: center;
    display: flex;
    margin: 15px;
    flex-flow: column;
    padding: 15px;

    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.07);

    @media ${deviceQuery.tabletL} {
      padding: 10px;
      margin: 10px;
    }
  }
  #share {
    z-index: 12;
    margin-top: -20rem;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.07);
    float: bottom;
    animation-delay: 1s;
    position: relative;
    // animation: showShare 5s linear;
  }

  #step-txt {
    width: 174px;
    height: 24px;
    left: 249px;
    top: 3799px;
    color: black;
    font-family: "Poppins";
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
  }
  #logo1 {
    margin-top: 5rem;
    margin-left: 8rem;
    // animation: mymove1 5s;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.07);
    z-index: 2;
  }
  #heart-icon {
    // animation-delay: 2s;
  }
  #img-btn {
    width: 10rem;
    margin-bottom: 1.2rem;
    margin-left: 4rem;
    // animation: btn-animation 4s;

    animation-delay: 1s;
  }

  #img-btn1 {
    width: 10rem;
    margin-bottom: 1.2rem;
    margin-left: 4rem;
    // animation: btn-animation 4s;
    animation-delay: 2s;
  }
  #img-btn2 {
    width: 10rem;
    margin-bottom: 1.2rem;
    margin-left: 4rem;
    // animation: btn-animation 1s;
    // animation: btn-animation 4s;
    animation-delay: 3s;
  }
  #img-btn3 {
    width: 10rem;
    margin-bottom: 1.2rem;
    margin-left: 4rem;
    // animation: btn-animation 4s;
    animation-delay: 4s;
  }
  .img-btn-div {
    margin-top: 15rem;
  }

  #logo2 {
    margin-top: 4rem;
    margin-left: 2rem;
    width: 28rem;
  }
  .steps-div {
    display: flex;
    justify-content: center;
    margin: 0 -15px;

    flex-wrap: wrap;
  }
  .media-div {
    display: flex;
    justify-content: space-around;
  }
  #heart {
    width: 23px;
    margin-left: 264px;
    margin-top: -57px;
    z-index: 1000;
  }
  .second-div {
    width: 747px;
    height: 800px;
    // left: 764px;
    // top: 717px;
    display: flex;
    justify-content: space-around;

    margin: auto;
    background: url(img2.png);
    background-repeat: no-repeat;
    // transform: rotate(-90deg);
    background-size: cover;
  }
  .third-div {
    width: 587px;
    max-width: 100%;
    margin: auto;
    background: url(img.png);
    background-repeat: no-repeat;
    background-size: cover;
    padding: 85px 0;

    @media ${deviceQuery.tablet} {
      padding: 40px 0;
    }

    .card3img-wrap {
      position: relative;
      display: inline-block;

      @media ${deviceQuery.tablet} {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }

      .card3 {
        width: 400px;
        margin-left: 6rem;
        position: relative;
      }
      .card3head {
        position: absolute;
        top: -84px;
        right: -147px;

        @media ${deviceQuery.tablet} {
          display: none;
        }
      }
    }
  }
  .first-div {
    width: 465px;

    left: 196px;
    top: 251px;
    margin: auto;

    @media ${deviceQuery.tabletL} {
      width: 800px;
      max-width: 100%;
      margin: 0 auto 50px;
    }
  }
  .steps-div {
    margin: 2rem -10px 0;
  }
  .mint-div {
    align-items: center;
    margin: auto;
    margin-top: 8rem;
    margin-bottom: 8rem;
    text-align: center;
    width: 100%;
  }
  // #bottom-background {
  //   background: url(img3.png);
  //   background-repeat: no-repeat;
  //   background-size: cover;
  //   // background-size: auto;
  //   width: 100%;
  //   height: 556px;
  // }
  #video-img {
    width: 721px;
    max-width: 100%;
    margin: auto;
    border: 1px solid gainsboro;
    position: relative;

    .video-back-img {
      width: 100%;
    }
  }
  #new-post {
    border: 1px solid gainsboro;
    width: inherit;
  }
  .play-icon {
    z-index: 4;
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    top: 0;
    left: 0;
    display: none;
    color: #4db2f0;
    align-items: center;
    justify-content: center;
  }
  #video-img:hover {
    cursor: pointer;
    .play-icon {
      display: flex;
    }
  }
  #head {
    // width: 183px;
    height: 45px;
    left: 628px;
    top: 1369px;

    font-family: "Poppins";
    font-style: normal;
    font-weight: 600;
    font-size: 30px;
    line-height: 45px;
  }
  #para {
    // width: 808px;
    height: 64px;
    left: 316px;
    top: 1430px;
    font-family: "Poppins";
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 32px;
  }
  .footer {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    border-top: 1px solid #1e4976;

    .link {
      color: ${({ theme }) => theme.palette.text.primary};

      &:hover {
        color: ${({ theme }) => theme.palette.text.secondary};
      }
    }
  }

  #side-image {
    background: url(img3.png);
    background-position: right center;
    width: 100%;
    background-repeat: no-repeat;
    padding: 6rem;
  }
  #bottom-image {
    background: url(img3.png);
    background-position: center bottom;
    width: 100%;
    background-repeat: no-repeat;
  }
  #social-logo {
    margin-left: 0.5rem;
    cursor: pointer;
  }
  #social {
    margin-left: 0.5rem;
    width: 6rem;
  }
  #cursor {
    cursor: pointer;
  }
  @media ${deviceQuery.tabletL} {
    .img-btn-div {
      display: none;
    }

    #new-post {
      width: inherit;
    }

    .footer {
      flex-flow: column;
      text-align: center;
      margin: auto;
    }

    .second-div {
      width: 350px;
      height: 350px;
    }

    #logo {
      width: 250px;
      height: 300px;
      margin-left: 0px;
      margin-top: 2rem;
    }
    #logo2 {
      width: 18rem;
    }
  }
  @media ${deviceQuery.mobileL} {
    .second-div {
      width: 350px;
      height: 350px;
    }
    #heart {
      margin-left: 196px;
      margin-top: -39px;
    }
    #logo {
      width: 250px;
      height: 300px;
      margin-left: 0px;
      margin-top: 2rem;
    }
    #logo1 {
      width: 11rem;

      margin-top: 2rem;
    }
    #share {
      width: 13rem;
      margin-top: -17rem;
    }
    .img-btn-div {
      display: none;
    }

    #new-post {
      width: inherit;
    }
    .footer {
      flex-flow: column;
      text-align: center;
      margin: auto;
    }

    .second-div {
      width: 350px;
      height: 350px;
    }

    #logo {
      width: 200px;
      height: 250px;
      margin-left: 0px;
      margin-top: 2rem;
    }
    #logo2 {
      width: 14rem;
    }
  }
`;
