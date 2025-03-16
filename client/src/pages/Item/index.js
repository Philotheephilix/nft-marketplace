import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  TextField,
  InputAdornment,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";
import Web3 from "web3";

import {
  selectedNft,
  removeSelectedNft,
} from "../../redux/actions/nftActions";

const softDark = "#1e1e1e";
const lightGray = "#ccc";
const sectionSpacing = { mt: 4, mb: 2 };

const Item = () => {
  const [priceInput, setPriceInput] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [offers, setOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const dispatch = useDispatch();
  const { nftId } = useParams();

  const { marketplaceContract, artTokenContract, account } = useSelector(
    (state) => state.allNft
  );
  const tokenContract = artTokenContract;

  const nftItem =
    useSelector((state) =>
      state.allNft.nft.find((nft) => nft.tokenId === nftId)
    ) || {};

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
  } = nftItem;

  useEffect(() => {
    if (nftId && nftItem) dispatch(selectedNft(nftItem));
    return () => dispatch(removeSelectedNft());
  }, [nftId]);

  useEffect(() => {
    if (tokenId) loadOffers();
  }, [tokenId, marketplaceContract]);

  const handlePriceChange = (e) => setPriceInput(e.target.value);
  const handleOfferChange = (e) => setOfferAmount(e.target.value);

  async function loadOffers() {
    if (!marketplaceContract || !tokenId) return;
    setIsLoadingOffers(true);
    try {
      const offerEvents = await marketplaceContract.getPastEvents(
        "OfferMade",
        {
          filter: { tokenId },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      const offersList = offerEvents.map((event, index) => ({
        bidder: event.returnValues.bidder,
        amount: event.returnValues.amount,
        index,
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
      await marketplaceContract.methods
        .putItemForSale(tokenId, priceInWei)
        .send({ gas: 210000, from: account });
      alert("Item listed for sale successfully!");
    } catch (error) {
      alert("Error while listing for sale!");
      console.error(error);
    }
  }

  async function buy(saleId, priceInEther) {
    try {
      await marketplaceContract.methods.buyItem(saleId).send({
        gas: 210000,
        value: priceInEther,
        from: account,
      });
      alert("Item purchased!");
    } catch (error) {
      alert("Error purchasing item.");
      console.error(error);
    }
  }

  async function makeOffer(tokenId, amountInEther) {
    const amount = parseFloat(amountInEther);
    if (!amount || amount <= 0) return alert("Enter a valid offer amount");

    const amountInWei = Web3.utils.toWei(amount.toFixed(18), "ether");

    try {
      const currentOwner = await tokenContract.methods.ownerOf(tokenId).call();
      if (currentOwner.toLowerCase() === account.toLowerCase())
        return alert("Cannot offer on your own NFT");

      const approvedAddress = await tokenContract.methods
        .getApproved(tokenId)
        .call();
      if (approvedAddress !== marketplaceContract.options.address) {
        const confirm = window.confirm("Approve marketplace to proceed?");
        if (!confirm) return alert("Approval required.");
        await tokenContract.methods
          .approve(marketplaceContract.options.address, tokenId)
          .send({ from: account });
      }

      await marketplaceContract.methods.makeOffer(tokenId).send({
        from: account,
        value: amountInWei,
        gas: 300000,
      });

      alert("Offer placed!");
      setOfferAmount("");
      loadOffers();
    } catch (error) {
      console.error("Offer failed:", error);
      alert("Error submitting offer.");
    }
  }

  async function acceptOffer(tokenId, index) {
    try {
      await marketplaceContract.methods
        .acceptOffer(tokenId, index)
        .send({ gas: 210000, from: account });
      alert("Offer accepted!");
      loadOffers();
    } catch (error) {
      alert("Error accepting offer");
      console.error(error);
    }
  }

  async function withdrawOffer(tokenId, index) {
    try {
      await marketplaceContract.methods
        .withdrawOffer(tokenId, index)
        .send({ gas: 210000, from: account });
      alert("Offer withdrawn");
      loadOffers();
    } catch (error) {
      alert("Error withdrawing offer");
      console.error(error);
    }
  }

  if (!tokenId) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor={softDark} color="white">
        <Typography variant="h6">Loading NFT details...</Typography>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bgcolor={'black'} color={lightGray} py={6}>
      <Container maxWidth="lg">
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          style={{ color: lightGray, borderColor: lightGray, marginBottom: '2rem' }}
        >
          Back
        </Button>

        <Grid container spacing={6} alignItems="flex-start" mt={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ background: "#2a2a2a", padding: 16 }}>
              <CardMedia
                component="img"
                src={image}
                alt={name}
                style={{ objectFit: "contain", maxHeight: 500 }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom style={{ fontWeight: 600,color: "#facc15" }}>
              {name}
            </Typography>
            <Typography variant="body2" color="inherit" style={{ fontWeight: 600 }}>
              <strong>Creator:</strong> {creator.slice(0, 6)}...{creator.slice(-4)}
            </Typography>
            <Typography variant="body2" color="inherit" gutterBottom style={{ fontWeight: 600 }}>
              <strong>Owner:</strong> {owner.slice(0, 6)}...{owner.slice(-4)}
            </Typography>

            <Box mt={3}>
              <Typography variant="body1" style={{ fontWeight: 400 }}>
                {description}
              </Typography>
            </Box>

            <Box mt={3} >
              <TextField
                label="Current Price"
                style={{ fontWeight: 400, fontSize: 16 }}
                value={Web3.utils.fromWei(price.toString(), "ether") + " ETH"}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
              />
            </Box>

            {owner === account && !isForSale && (
              <Box {...sectionSpacing}>
                <Typography variant="subtitle1" gutterBottom>
                  List For Sale
                </Typography>
                <TextField
                  label="Price in ETH"
                  variant="outlined"
                  fullWidth
                  style={{ fontWeight: 400, fontSize: 16 }}
                  value={priceInput}
                  onChange={handlePriceChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">Ξ</InputAdornment>
                    ),
                    style: { color: "white" }
                  }}
                  InputLabelProps={{ style: { color: "white" } }}
                />
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => putForSale(tokenId, priceInput)}
                  >
                    Sell
                  </Button>
                </Box>
              </Box>
            )}

            {owner !== account && isForSale && (
              <Box {...sectionSpacing}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => buy(saleId, price)}
                >
                  Buy for {Web3.utils.fromWei(String(price), "ether")} ETH
                </Button>
              </Box>
            )}

            {owner !== account && (
              <Box {...sectionSpacing}>
                <Typography variant="h6" gutterBottom>
                  Make an Offer
                </Typography>
                <TextField
                  label="Your Offer (ETH)"
                  variant="outlined"
                  fullWidth
                  value={offerAmount}
                  onChange={handleOfferChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">Ξ</InputAdornment>
                    ),
                    style: { color: "white" }
                  }}
                  InputLabelProps={{ style: { color: "white" } }}
                />
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={() => makeOffer(tokenId, offerAmount)}
                  >
                    Submit Offer
                  </Button>
                </Box>
              </Box>
            )}

            {/* Rest of the code remains the same */}
            {isLoadingOffers ? (
              <Box {...sectionSpacing} display="flex" alignItems="center">
                <CircularProgress size={24} style={{ color: lightGray }} />
                <Typography style={{ marginLeft: 10 }}>Loading offers...</Typography>
              </Box>
            ) : (
              <>
                {owner === account && offers.length > 0 && (
                  <Box {...sectionSpacing}>
                    <Typography variant="h6">Offers Received</Typography>
                    <List>
                      {offers.map((offer, i) => (
                        <ListItem key={i} divider>
                          <ListItemText
                            primary={`From: ${offer.bidder.slice(0, 6)}...${offer.bidder.slice(-4)}`}
                            secondary={
                              <Typography style={{ color: '#fff' }}>
                                {`${Web3.utils.fromWei(offer.amount, "ether")} ETH`}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => acceptOffer(tokenId, offer.index)}
                            >
                              <CheckIcon style={{ color: "limegreen" }} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {owner !== account &&
                  offers.some(
                    (o) => o.bidder.toLowerCase() === account.toLowerCase()
                  ) && (
                    <Box {...sectionSpacing}>
                      <Typography variant="h6">Your Offers</Typography>
                      <List>
                        {offers
                          .filter(
                            (o) =>
                              o.bidder.toLowerCase() === account.toLowerCase()
                          )
                          .map((offer, i) => (
                            <ListItem key={i} divider>
                              <ListItemText
                                primary="Your Offer"

                                secondary={`${Web3.utils.fromWei(
                                  offer.amount,
                                  "ether"
                                )} ETH`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  onClick={() =>
                                    withdrawOffer(tokenId, offer.index)
                                  }
                                >
                                  <CloseIcon style={{ color: "tomato" }} />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                      </List>
                    </Box>
                  )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Item;
