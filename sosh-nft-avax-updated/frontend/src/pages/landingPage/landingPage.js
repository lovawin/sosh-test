import PlayIcon from "assets/icons/playIcon";
import React from "react";
import { Main } from "./style";
import Routes from "constants/routes";
import { NavLink } from "react-router-dom";
import { APP_SOCIAL_LINKS } from "constants/appConstants";

function LandingPage() {
  return (
    <Main className="container-fluid">
      <div className="top-container">
        <div className="first-div">
          <div id="title">
            {" "}
            Where Content Pays More Than Likes and Engagement
          </div>
          <div>
            Content Creators and Influencers - You shape the Culture, you set
            the trends. Get paid for your content. License you best content on
            Sosh.
          </div>
        </div>
        <div className="second-div">
          <div>
            <img data-aos="fade-left" id="logo" src="grp.png" alt="" />
          </div>
          <div className="img-btn-div">
            <img
              data-aos="fade-right"
              data-aos-delay="300"
              id="img-btn"
              src="/youtubebtn.png"
              alt="youtube"
            />
            <img
              data-aos="fade-right"
              data-aos-delay="600"
              id="img-btn1"
              src="/twitterbtn.svg"
              alt="twitter"
            />
            <img
              data-aos="fade-right"
              data-aos-delay="900"
              id="img-btn2"
              src="/instabtn.png"
              alt="instagram"
            />
            <img
              data-aos="fade-right"
              data-aos-delay="1200"
              id="img-btn3"
              src="/tiktokbtn.png"
              alt="tiktok"
            />
          </div>
        </div>
      </div>
      <div className="top-container reverse">
        <div className="third-div">
          <div data-aos="fade-right">
            {" "}
            <img id="logo1" src="grp1.png" alt="" />
            <div id="heart">
              {" "}
              <img
                style={{ width: "20px" }}
                id="heart-icon"
                data-aos-delay="600"
                src="heart.svg"
                className="animate__animated animate__heartBeat animate__infinite	infinite"
                alt=""
              />
            </div>
          </div>
          <img
            data-aos="fade-zoom-in"
            data-aos-easing="ease-in-back"
            data-aos-delay="300"
            id="share"
            src="share.png"
            alt=""
          />
        </div>
        <div className="first-div">
          <div id="title">
            {" "}
            NFT Collectors and Entertainment and Media Companies
          </div>
          <div>
            Own NFTs verified by the hottest content creators and influencers on
            social media.
          </div>
        </div>
      </div>
      <div className="mint-div">
        <div id="head">Easy To Mint</div>
        <div id="para">
          Simply connect your digital wallet, click "New Post," and complete the
          NFT Details and Create New Post fields.
        </div>
        <div id="side-image">
          <img id="new-post" src="createNft.png" alt="" />
        </div>
      </div>
      <div className="top-container">
        <div className="first-div">
          <div id="title"> Buy and Sell Content on Sosh</div>
          <div>
          Use our marketplace to buy and sell content on Sosh
          </div>
        </div>
        <div className="third-div">
          <div className="card3img-wrap" data-aos="fade-left">
            <img
              className="card3head"
              src="/landing-page/card3head.png"
              alt=""
            />
            <img className="card3" src="/landing-page/card3.png" alt="" />
          </div>
        </div>
      </div>

      <div className="mint-div">
        <div id="head" style={{ marginBottom: "1rem" }}>
          Sosh Tutorial
        </div>
        {/* <div id="bottom-background">  */}
        <div id="video-img">
          <img className="video-back-img" src="/createNft.png" alt="" />
          <div className="play-icon">
            <PlayIcon className="play" />
          </div>
        </div>
      </div>
      {/* </div> */}

      <div className="mint-div">
        <div id="head">How to use Sosh</div>
        <div className="steps-div">
          <div id="step">
            <div>
              <img id="social" src="step1.gif" alt="" />
            </div>
            <div id="step-txt">Create viral content</div>
          </div>
          <div id="step">
            <div>
              <img id="social" src="step2.gif" alt="" />
            </div>
            <div id="step-txt">Mint your content as an NFT</div>
          </div>
          <div id="step">
            <div>
              <img id="social" src="step3.gif" alt="" />
            </div>
            <div id="step-txt">List your NFT</div>
          </div>
          <div id="step">
            <div>
              <img id="social" src="step4.gif" alt="" />
            </div>
            <div id="step-txt">Get paid from sales</div>
          </div>
        </div>
      </div>
      <div className="footer">
        <NavLink className="link" to={Routes.privacyPolicy}>
          Privacy Policy
        </NavLink>
        <NavLink className="link" to={Routes.termsOfService}>
          Terms of Service
        </NavLink>

        <div style={{ color: "#67BDF5" }}>Copyright 2022 by Sosh, Inc.</div>
        <div></div>
        <div className="media-div">
          Follow Us On :
          <a target="_blank" rel="noreferrer" href={APP_SOCIAL_LINKS.TIKTOK}>
            <img id="social-logo" src="/tictok.png" alt="" />
          </a>
          <a target="_blank" rel="noreferrer" href={APP_SOCIAL_LINKS.INSTAGRAM}>
            <img id="social-logo" src="/insta.png" alt="" />
          </a>
          <a target="_blank" rel="noreferrer" href={APP_SOCIAL_LINKS.TWITTER}>
            <img
              id="social-logo"
              width={24}
              height={24}
              src="/twitter.svg"
              alt=""
            />
          </a>
          <a target="_blank" rel="noreferrer" href={APP_SOCIAL_LINKS.YOUTUBE}>
            <img id="social-logo" src="/youtube.png" alt="" />
          </a>
        </div>
      </div>
    </Main>
  );
}
export default LandingPage;
