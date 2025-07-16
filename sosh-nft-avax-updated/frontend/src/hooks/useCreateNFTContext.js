import { CreateNFTContext } from "contexts/createNFTContext";
import { useContext } from "react";

const useCreateNFTContext = () => {
  const context = useContext(CreateNFTContext);

  if (!context)
    throw new Error(
      "CreateNFTContext must be used within a CreateNFTContextProvider"
    );

  return context;
};
export default useCreateNFTContext;
