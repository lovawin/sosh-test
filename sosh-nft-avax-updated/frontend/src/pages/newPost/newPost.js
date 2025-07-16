import Routes from "constants/routes";
import { Link } from "react-router-dom";
import { Main, Header, Desc, Container, Image, ImgContainer } from "./style";
function NewPost() {
  return (
    <>
      <Main>
        <Header>Upload File</Header>
        <Desc>Select the platform where you want to upload file</Desc>
        <ImgContainer>
          <Link to={Routes.createNFT}>
            {" "}
            <Container>
              <Image src="Instagram_logo_2016.png" />
              <br />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                />
              </svg>
            </Container>
          </Link>
          <Link to={Routes.createNFT}>
            {" "}
            <Container>
              <Image src="valencia-spain-march-05-2017-260nw-601425683.png" />
              <br />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                />
              </svg>
            </Container>
          </Link>
          <Link to={Routes.createNFT}>
            {" "}
            <Container>
              <Image src="5e5e88a019d59.png" />
              <br />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                />
              </svg>
            </Container>
          </Link>
        </ImgContainer>
      </Main>
    </>
  );
}

export default NewPost;
