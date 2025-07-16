import ArrowLeft from "assets/icons/arrowLeft";
import ImageComponent from "components/ImageComponent";
import { NavLink } from "react-router-dom";
import { Main } from "./style";
import Routes from "constants/routes";

function ImageCorousal(props) {
  const { prev, next, src } = props;

  return (
    <>
      <Main>
        <div className="asset-image-container">
          <ImageComponent src={src} freeSize />
          {prev && (
            <NavLink
              to={`${Routes.nftDetail}/${prev}`}
              className="nav-item left"
            >
              <ArrowLeft className="icon" />
            </NavLink>
          )}
          {next && (
            <NavLink
              to={`${Routes.nftDetail}/${next}`}
              className="nav-item right"
            >
              <ArrowLeft className="icon" />
            </NavLink>
          )}
        </div>
        {/* <Carousel>
          <ImgDiv>
            {" "}
            <img src="sample.png" />{" "}
          </ImgDiv>
          <ImgDiv>
            {" "}
            <img src="sample.png" />{" "}
          </ImgDiv>
          <ImgDiv>
            {" "}
            <img src="sample.png" />{" "}
          </ImgDiv>
          <ImgDiv>
            {" "}
            <img src="sample.png" />{" "}
          </ImgDiv>
          <ImgDiv>
            {" "}
            <img src="sample.png" />{" "}
          </ImgDiv>
          <ImgDiv>
            {" "}
            <img src="sample.png" />{" "}
          </ImgDiv>
        </Carousel> */}
        {/* {true ? (
          <FullImage>
            {" "}
            <ImageFullScreen />
          </FullImage>
        ) : (
          ""
        )} */}
      </Main>
    </>
  );
}

export default ImageCorousal;
