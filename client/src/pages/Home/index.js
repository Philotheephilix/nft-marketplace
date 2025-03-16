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
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <img
          src="/PHOTO-2025-01-20-13-02-12.jpg"
          alt="Hero"
          style={styles.heroImage}
        />
        <div style={styles.textContent}>
          <h1 style={styles.heroTitle}>
            <span style={styles.heroSubtitle}>The world of pixel animals</span>
            <br />
            Pixel Animals
          </h1>
          <p style={styles.description}>
            Discover unique digital pixel animals in our NFT marketplace.
            Each piece is a carefully crafted pixel art creation,
            bringing adorable creatures to the blockchain.
          </p>
          <Link to="/create-nft" style={styles.mintButton}>
            Mint Your Art
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#000000",
    color: "white",
    height: "100vh",
    width: "100vw",
    padding: 0,
    margin: 0,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  contentWrapper: {
    maxWidth: "1200px",
    width: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "2rem",
  },
  heroImage: {
    borderRadius: "1rem",
    width: "400px",
    height: "auto",
    objectFit: "cover",
    boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)",
  },
  textContent: {
    maxWidth: "600px",
  },
  heroTitle: {
    fontSize: "3rem",
    lineHeight: "1.2",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  heroSubtitle: {
    fontSize: "1.5rem",
    color: "#facc15",
  },
  description: {
    fontSize: "1.1rem",
    marginBottom: "2rem",
    color: "#d4d4d4",
  },
  mintButton: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#22c55e",
    color: "black",
    borderRadius: "0.5rem",
    fontWeight: "600",
    textDecoration: "none",
    transition: "background-color 0.3s ease",
  },
};

export default Home;
