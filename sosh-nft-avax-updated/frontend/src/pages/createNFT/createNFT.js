import NftDetail from "../../components/nftDetails/nftDetails";
import CreateNFTComponent from "../../components/createPost/createPost";
import { Main } from "./style";
import { useSelector } from "react-redux";
import CreateNFTContextProvider from "contexts/createNFTContext";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";

function CreateNFT() {
  const isUpdate = useSelector((state) => state.data.isUpdate);

  return (
    <CreateNFTContextProvider>
      <Main>
        <div className="col">
          <NftDetail />
        </div>
        <div className="col">
          <CreateNFTComponent />
        </div>
      </Main>
      {isUpdate ? <LoadingBubbleCircle /> : ""}
    </CreateNFTContextProvider>
  );
}

export default CreateNFT;
