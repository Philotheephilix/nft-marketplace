import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

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


const Home = () => {
  const nft = useSelector((state) => state.allNft.nft);
  const dispatch = useDispatch();

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
          // console.log("Contract: ", artTokenContract);
          const marketplaceContract = new web3.eth.Contract(
            ArtMarketplace.abi,
            ArtMarketplace.networks[networkId].address
          );
          const totalSupply = await artTokenContract.methods
            .totalSupply()
            .call();
          const totalItemsForSale = await marketplaceContract.methods
            .totalItemsForSale()
            .call();

          for (var tokenId = 1; tokenId <= totalSupply; tokenId++) {
            let item = await artTokenContract.methods.Items(tokenId).call();
            let owner = await artTokenContract.methods.ownerOf(tokenId).call();

            const response = await api
              .get(`/tokens/${tokenId}`)
              .catch((err) => {
                console.log("Err: ", err);
              });
            console.log("response: ", response);

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
            for (var saleId = 0; saleId < totalItemsForSale; saleId++) {
              let item = await marketplaceContract.methods
                .itemsForSale(saleId)
                .call();
              let active = await marketplaceContract.methods
                .activeItems(item.tokenId)
                .call();

              let itemListIndex = itemsList.findIndex(
                (i) => i.tokenId === item.tokenId
              );

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
          alert(
            "Contracts not deployed to the current network " +
              networkId.toString()
          );
        }
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.` +
            error
        );
        console.error(error);
      }
    };
    init();
  }, [dispatch]);

  console.log("Nft :", nft);

  const nftItem = useSelector((state) => state.allNft.nft);

  return (
    <div className="App" style={{backgroundColor: "black"}}>
      <div className="image-wrapper">
        <img
          src="/PHOTO-2025-01-20-13-02-12.jpg"
          alt="New Hero Image"
          width={200}
          height={100}
        />
      </div>

      <div className="hero-text">
        <h1 className="hero-title">
          <span className="hero-subtitle">The world of pixel animals</span>
          <br />
          pixel animals
        </h1>

        <p className="hero-description">
          Discover unique digital pixel animals in our NFT marketplace.
          Each piece is a carefully crafted pixel art creation,
          bringing adorable creatures to the blockchain.
        </p>

        <div className="mint-button-wrapper">
          <section className="banner">
            <Link to="/create-nft">
                Mint your art
            </Link>
          </section>
        </div>
      </div>

      <div className="homepage">
        <section className="all-nfts">
          <Typography className="nft-title">Latest artwork</Typography>
          <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {nftItem.map((nft) => (
              <Grid item key={nft.tokenId}>
                <Card {...nft} />
              </Grid>
            ))}
          </Grid>
        </section>
      </div>
    </div>

  );
};

export default Home;
