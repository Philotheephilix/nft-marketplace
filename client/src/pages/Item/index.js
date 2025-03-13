import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Web3 from "web3";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import { selectedNft, removeSelectedNft } from "../../redux/actions/nftActions";
import { useStyles } from "./styles.js";

const Item = () => {
  const classes = useStyles();
  const [priceInput, setPriceInput] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [offers, setOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const handlePriceChange = (event) => {
    setPriceInput(event.target.value);
  };

  const handleOfferChange = (event) => {
    setOfferAmount(event.target.value);
  };
  const { 
    marketplaceContract, 
    artTokenContract,  // Match reducer property name
    account 
  } = useSelector((state) => state.allNft);
  const tokenContract = artTokenContract;

  const { nftId } = useParams();
  const marketplaceAddress = marketplaceContract?.options?.address;

  let nft = useSelector((state) => state.nft);  
  let nftItem = useSelector((state) =>
    state.allNft.nft.filter((nft) => nft.tokenId === nftId)
  );
  const {
    image,
    name,
    price,
    owner,
    creator,
    description,
    tokenId,
    saleId,
    isForSale,
    isSold,
  } = nft;
  const dispatch = useDispatch();

  useEffect(() => {
    if (nftId && nftId !== "" && nftItem) dispatch(selectedNft(nftItem[0]));
    return () => {
      dispatch(removeSelectedNft());
    };
  }, [nftId]);

  useEffect(() => {
    if (tokenId) {
      loadOffers();
    }
  }, [tokenId, marketplaceContract]);

  async function loadOffers() {
    if (!marketplaceContract || !tokenId) return;
    
    setIsLoadingOffers(true);
    try {
      // This is a simplified approach - in a real app, you would need to create events or query functions
      // to get all offers for a specific token
      const offerEvents = await marketplaceContract.getPastEvents('OfferMade', {
        filter: { tokenId: tokenId },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      const offersList = await Promise.all(offerEvents.map(async (event, index) => {
        return {
          bidder: event.returnValues.bidder,
          amount: event.returnValues.amount,
          index: index
        };
      }));
      
      setOffers(offersList);
    } catch (error) {
      console.error("Error loading offers:", error);
    } finally {
      setIsLoadingOffers(false);
    }
  }

  async function putForSale(tokenId, priceInEther) {
    try {
      const priceInWei = Web3.utils.toWei(priceInEther.toString(), "ether");
  
      const receipt = await marketplaceContract.methods
        .putItemForSale(tokenId, priceInWei)
        .send({ gas: 210000, from: account });
  
      console.log(receipt);
      alert("Item listed for sale successfully!");
    } catch (error) {
      console.error("Error listing for sale: ", error);
      alert("Error while listing for sale!");
    }
  }

  async function buy(saleId, priceInEther) {
    try {
      const priceInWei = priceInEther;
  
      const receipt = await marketplaceContract.methods
        .buyItem(saleId)
        .send({ gas: 210000, value: priceInWei, from: account });
  
      console.log(receipt);
      alert("Item purchased successfully!");
    } catch (error) {
      console.error("Error purchasing item: ", error);
      alert("Error while purchasing item!");
    }
  }
  async function approveMarketplace(tokenId) {
    try {
      await tokenContract.methods
        .approve(marketplaceAddress, tokenId)
        .send({ from: account });
      alert("Marketplace approved successfully!");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Check console for details.");
    }
  }

  async function makeOffer(tokenId, amountInEther) {
    // Validate contracts are loaded
    if (!tokenContract || !marketplaceContract) {
      alert("Contracts not initialized. Please refresh the page.");
      return;
    }
    console.log("Making offer on tokenId:", tokenId);
console.log("Active item:", await marketplaceContract.methods.activeItems(tokenId).call());
console.log("Amount in Wei:", amountInEther);

  
    // Validate input amount
    const amount = parseFloat(amountInEther);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number for the offer amount");
      return;
    }
  
    try {
      // Convert ETH to Wei safely
      const amountInWei = Web3.utils.toWei(amount.toFixed(18), "ether");
  
      // Get real-time owner from blockchain
      const currentOwner = await tokenContract.methods
        .ownerOf(tokenId)
        .call();
  
      // Validate user isn't owner
      if (currentOwner.toLowerCase() === account.toLowerCase()) {
        alert("Error: You can't make offers on your own NFT");
        return;
      }
  
      // Get marketplace address safely
      const marketplaceAddress = marketplaceContract.options.address;
  
      // Check approval status
      const approvedAddress = await tokenContract.methods
        .getApproved(tokenId)
        .call();
  
      // Handle marketplace approval
      if (approvedAddress !== marketplaceAddress) {
        const confirmApproval = window.confirm(
          "You need to approve the marketplace to handle this NFT. This requires a transaction."
        );
        
        if (!confirmApproval) {
          alert("Offer canceled: Marketplace approval required");
          return;
        }
  
        await tokenContract.methods
          .approve(marketplaceAddress, tokenId)
          .send({ from: account });
      }
  
      // // Simulate transaction first
      // await marketplaceContract.methods
      //   .makeOffer(tokenId)
      //   .call({ 
      //     value: amountInWei, 
      //     from: account 
      //   });
  
      // Estimate gas with fallback
      let gasEstimate;
      try {
        gasEstimate = await marketplaceContract.methods
          .makeOffer(tokenId)
          .estimateGas({ 
            value: amountInWei, 
            from: account 
          });
      } catch (estimateError) {
        console.warn("Gas estimation failed, using fallback", estimateError);
        gasEstimate = 30000000; // Fallback value
      }
  
      // Add 20% buffer to gas estimate
      const gasWithBuffer = Math.floor(gasEstimate * 1.2);
  
      // Send actual transaction
      const receipt = await marketplaceContract.methods
        .makeOffer(tokenId)
        .send({
          from: account,
          value: amountInWei,
          gas: gasWithBuffer
        });
  
      console.log("Offer successful. Transaction receipt:", receipt);
      alert("Offer placed successfully!");
      
      // Refresh offers list
      await loadOffers();
      setOfferAmount("");
  
    } catch (error) {
      console.error("Offer failed:", error);
  
      // User-friendly error messages
      let errorMessage = "Failed to make offer. Please try again.";
      
      if (error.message.includes("revert")) {
        const revertReason = error.message.split("revert ")[1] || "Contract restriction";
        errorMessage = `Transaction rejected: ${revertReason}`;
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH balance for this offer";
      } else if (error.code === 4001) {
        errorMessage = "Transaction rejected by user";
      }
  
      alert(errorMessage);
    }
  }
  async function acceptOffer(tokenId, offerIndex) {
    try {
      const receipt = await marketplaceContract.methods
        .acceptOffer(tokenId, offerIndex)
        .send({ gas: 210000, from: account });
  
      console.log(receipt);
      alert("Offer accepted successfully!");
      loadOffers();
    } catch (error) {
      console.error("Error accepting offer: ", error);
      alert("Error while accepting offer!");
    }
  }

  async function withdrawOffer(tokenId, offerIndex) {
    try {
      const receipt = await marketplaceContract.methods
        .withdrawOffer(tokenId, offerIndex)
        .send({ gas: 210000, from: account });
  
      console.log(receipt);
      alert("Offer withdrawn successfully!");
      loadOffers();
    } catch (error) {
      console.error("Error withdrawing offer: ", error);
      alert("Error while withdrawing offer!");
    }
  }

  return (
    <div className={classes.pageItem}>
      {Object.keys(nft).length === 0 ? (
        <div>...CARREGANDO</div>
      ) : (
        <main>
          <header className={classes.pageHeader}>
            <Link to="/">
              <KeyboardBackspaceIcon fontSize="large" />
            </Link>
          </header>
          <section>
            <Grid container 
              spacing={0} 
              alignItems="center"
              justify="center"
            >
              <Grid item md={7} sm={7} xs={12}>
                <figure> 
                  <img className="ui fluid image" src={image} />
                </figure>
              </Grid>
              <Grid item md={5} sm={5} xs={12}>
                <fieldset>
                  <h1>{name}</h1>
                  <TextField
                    label="creator"
                    name="creator"
                    variant="filled"
                    margin="dense"
                    fullWidth
                    disabled
                    defaultValue={
                      creator.slice(0, 7) + "..." + creator.slice(-4)
                    }
                  />
                  <TextField
                    label="owner"
                    name="owner"
                    variant="filled"
                    disabled
                    fullWidth
                    margin="dense"
                    defaultValue={owner.slice(0, 7) + "..." + owner.slice(-4)}
                  />
                  <TextField
                    id="outlined-multiline-static"
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    variant="filled"
                    margin="dense"
                    disabled
                    fullWidth
                    defaultValue={description}
                  />
                  <TextField
                    label="price"
                    name="price"
                    variant="filled"
                    margin="dense"
                    defaultValue={Web3.utils.fromWei(String(price), "ether")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">ETH</InputAdornment>
                      ),
                    }}
                    fullWidth
                    disabled
                  />
                  
                  {/* Owner Controls */}
                  {owner === account && !isForSale && (
                    <div>
                      <TextField
                        label="Price (ETH)"
                        name="price"
                        variant="filled"
                        margin="dense"
                        value={priceInput}
                        onChange={handlePriceChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">ETH</InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => putForSale(tokenId, priceInput)}
                      >
                        Sell
                      </Button>
                    </div>
                  )}
                  
                  {/* Buy Button - Only show if item is for sale */}
                  {owner !== account && isForSale && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      style={{ marginBottom: '20px' }}
                      onClick={() => buy(saleId, price)}
                    >
                      Buy for {Web3.utils.fromWei(String(price), "ether")} ETH
                    </Button>
                  )}
                  
                  {/* Make Offer Section - Show for any non-owner, regardless of for sale status */}
                  {owner !== account && (
                    <div>
                      <Divider style={{ margin: '20px 0' }} />
                      
                      <Typography variant="h6">Make an Offer</Typography>
                      <TextField
                        label="Offer Amount (ETH)"
                        name="offerAmount"
                        variant="filled"
                        margin="dense"
                        value={offerAmount}
                        onChange={handleOfferChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">ETH</InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={() => makeOffer(tokenId, offerAmount)}
                      >
                        Submit Offer
                      </Button>
                    </div>
                  )}
                  
                  {/* Offers list for owner */}
                  {owner === account && offers.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <Divider style={{ margin: '20px 0' }} />
                      <Typography variant="h6">Offers Received</Typography>
                      {isLoadingOffers ? (
                        <p>Loading offers...</p>
                      ) : (
                        <List>
                          {offers.map((offer, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={`${offer.bidder.slice(0, 7)}...${offer.bidder.slice(-4)}`}
                                secondary={`${Web3.utils.fromWei(offer.amount, "ether")} ETH`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  edge="end" 
                                  aria-label="accept"
                                  onClick={() => acceptOffer(tokenId, offer.index)}
                                >
                                  <CheckIcon color="primary" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </div>
                  )}
                  
                  {/* User's own offers with withdraw option */}
                  {owner !== account && offers.filter(offer => 
                    offer.bidder.toLowerCase() === account.toLowerCase()
                  ).length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <Divider style={{ margin: '20px 0' }} />
                      <Typography variant="h6">Your Offers</Typography>
                      {isLoadingOffers ? (
                        <p>Loading your offers...</p>
                      ) : (
                        <List>
                          {offers
                            .filter(offer => offer.bidder.toLowerCase() === account.toLowerCase())
                            .map((offer, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary="Your offer"
                                  secondary={`${Web3.utils.fromWei(offer.amount, "ether")} ETH`}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton 
                                    edge="end" 
                                    aria-label="withdraw"
                                    onClick={() => withdrawOffer(tokenId, offer.index)}
                                  >
                                    <CloseIcon color="secondary" />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                        </List>
                      )}
                    </div>
                  )}
                </fieldset>
              </Grid>
            </Grid>
          </section>
        </main>
      )}
    </div>
  );
};

export default Item;