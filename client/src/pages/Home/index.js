import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import getWeb3 from "../../utils/getWeb3";

import ArtMarketplace from "../../contracts/ArtMarketplace.json";
import ArtToken from "../../contracts/ArtToken.json";

const Home = () => {
  const nft = useSelector((state) => state.allNft.nft);
  const dispatch = useDispatch();

  useEffect(() => {
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
    </div>

  );
};

export default Home;
