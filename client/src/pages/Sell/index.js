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

const styles = {
  container: {
    backgroundColor: "black",
    minHeight: "100vh",
    padding: "2rem",
  },
  section: {
    margin: "2rem auto",
    maxWidth: "1200px",
  },
  title: {
    color: "yellow",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    fontSize: "2rem",
  },
  mintButton: {
    display: "block",
    margin: "0 auto 2rem auto",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#4CAF50",
    color: "black",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

const SellNFT = () => {
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
          return;
        }

        const networkId = await web3.eth.net.getId();
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

            if (itemListIndex !== -1) {
              itemsList[itemListIndex] = {
                ...itemsList[itemListIndex],
                isForSale: active,
                saleId: item.id,
                price: item.price,
                isSold: item.isSold,
              };
            }
          }
        }

        dispatch(setAccount(accounts[0]));
        dispatch(setTokenContract(artTokenContract));
        dispatch(setMarketContract(marketplaceContract));
        dispatch(setNft(itemsList));
      } catch (error) {
        console.error("Initialization error:", error);
        alert("Error loading blockchain data.");
      }
    };

    init();
  }, [dispatch]);

  const ownedNfts = nft.filter((item) => item.owner.toLowerCase() === account?.toLowerCase());

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <Typography style={styles.title}>Sell Your NFT</Typography>
        <button style={styles.mintButton} onClick={() => history.push('/create-nft')}>
          Mint your own NFT
        </button>

        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
          {ownedNfts.map((nft) => (
            <Grid item key={nft.tokenId}>
              <Card {...nft} />
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default SellNFT;
