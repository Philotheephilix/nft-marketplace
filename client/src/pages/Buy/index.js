import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";

import getWeb3 from "../../utils/getWeb3";
import { api } from "../../services/api";

import ArtMarketplace from "../../contracts/ArtMarketplace.json";
import ArtToken from "../../contracts/ArtToken.json";

import {
  setNft,
  setAccount,
  setTokenContract,
  setMarketContract,
} from "../../redux/actions/nftActions";
import Card from "../../components/Card";

const BuyNFT = () => {
  const nft = useSelector((state) => state.allNft.nft);
  const account = useSelector((state) => state.allNft.account);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    let itemsList = [];
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();

        if (typeof accounts === undefined) {
          alert("Please login with Metamask!");
          console.log("login to metamask");
        }

        const networkId = await web3.eth.net.getId();
        try {
          const artTokenContract = new web3.eth.Contract(
            ArtToken.abi,
            ArtToken.networks[networkId].address
          );
          const marketplaceContract = new web3.eth.Contract(
            ArtMarketplace.abi,
            ArtMarketplace.networks[networkId].address
          );

          const totalSupply = await artTokenContract.methods.totalSupply().call();
          const totalItemsForSale = await marketplaceContract.methods.totalItemsForSale().call();

          for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
            let item = await artTokenContract.methods.Items(tokenId).call();
            let owner = await artTokenContract.methods.ownerOf(tokenId).call();

            const response = await api.get(`/tokens/${tokenId}`).catch((err) => {
              console.log("Err: ", err);
            });

            itemsList.push({
              name: response.data.name,
              description: response.data.description,
              image: response.data.image,
              tokenId: item.id,
              creator: item.creator,
              owner: owner,
              uri: item.uri,
              isForSale: false,
              saleId: null,
              price: 0,
              isSold: null,
            });
          }

          if (totalItemsForSale > 0) {
            for (let saleId = 0; saleId < totalItemsForSale; saleId++) {
              let item = await marketplaceContract.methods.itemsForSale(saleId).call();
              let active = await marketplaceContract.methods.activeItems(item.tokenId).call();

              let itemListIndex = itemsList.findIndex((i) => i.tokenId === item.tokenId);
              itemsList[itemListIndex] = {
                ...itemsList[itemListIndex],
                isForSale: active,
                saleId: item.id,
                price: item.price,
                isSold: item.isSold,
              };
            }
          }

          dispatch(setAccount(accounts[0]));
          dispatch(setTokenContract(artTokenContract));
          dispatch(setMarketContract(marketplaceContract));
          dispatch(setNft(itemsList));
        } catch (error) {
          console.error("Error", error);
          alert("Contracts not deployed to the current network " + networkId.toString());
        }
      } catch (error) {
        alert(`Failed to load web3, accounts, or contract. Check console for details.` + error);
        console.error(error);
      }
    };
    init();
  }, [dispatch]);

  const nftItem = useSelector((state) => state.allNft.nft);
  const otherUsersNfts = nftItem.filter(
    (item) => item.owner.toLowerCase() !== account?.toLowerCase()
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <Typography variant="h4" style={styles.title}>
          Buy from the Gallery of NFTs
        </Typography>

        {otherUsersNfts.length === 0 ? (
          <div style={styles.emptyState}>
            <Typography variant="h6" style={styles.emptyText}>
              No NFTs found in the marketplace.
            </Typography>
            <button style={styles.mintButton} onClick={() => history.push("/create-nft")}>
              Mint your own NFT
            </button>
          </div>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {otherUsersNfts.map((nft) => (
              <Grid item key={nft.tokenId}>
                <Card {...nft} />
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "4rem",
    paddingBottom: "4rem",
  },
  contentWrapper: {
    width: "90%",
    maxWidth: "1200px",
  },
  title: {
    textAlign: "center",
    color: "#facc15",
    fontWeight: "bold",
    marginBottom: "2rem",
  },
  emptyState: {
    textAlign: "center",
    marginTop: "3rem",
  },
  emptyText: {
    color: "#d4d4d4",
    marginBottom: "1rem",
  },
  mintButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#22c55e",
    color: "#000",
    fontWeight: "bold",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s ease",
  },
};

export default BuyNFT;
