import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import CancelOutlinedIcon  from "@material-ui/icons/CancelOutlined";
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useStyles } from "./styles.js";
import DropZone from "../../components/DropZone";
import { api } from "../../services/api";
import Web3 from "web3";

const CreateNFT = () => {
  const classes = useStyles();
  const history = useHistory();
  const web3 = new Web3(Web3.givenProvider);

  const account = useSelector((state) => state.allNft.account);
  const artTokenContract = useSelector((state) => state.allNft.artTokenContract);
  const marketplaceContract = useSelector((state) => state.allNft.marketplaceContract);

  const [selectedFile, setSelectedFile] = useState();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  async function createNFT(event) {
    event.preventDefault();
    const { title, description, price } = formData;
  
    if (!artTokenContract) {
      console.error("ArtToken contract is not initialized");
      return;
    }
  
    const data = new FormData();
    data.append("name", title);
    data.append("description", description);
  
    if (selectedFile) {
      data.append("img", selectedFile);
    }
  
    try {
      const totalSupply = await artTokenContract.methods.totalSupply().call();
      data.append("tokenId", Number(totalSupply) + 1);
  
      const response = await api.post("/tokens", data, {
        headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}` },
      });
  
      await mint(response.data.message, price);
    } catch (error) {
      console.error("Creation error:", error);
      alert("Error creating NFT!");
    }
  }

  async function mint(tokenMetadataURL, price) {
    if (!artTokenContract || !marketplaceContract) {
      console.error("Contracts are not initialized");
      return;
    }
  
    try {
      const receipt = await artTokenContract.methods
        .mint(tokenMetadataURL)
        .send({ from: account });
  
      const tokenId = receipt.events.Transfer.returnValues.tokenId;
  
      const priceInWei = web3.utils.toWei(price.toString(), "ether");
      await marketplaceContract.methods
        .putItemForSale(tokenId, priceInWei)
        .send({ from: account });
  
      history.push("/");
    } catch (error) {
      console.error("Minting/Listing error:", error);
      alert("Error in minting or listing NFT!");
    }
  }

  return (
    <div className={classes.pageCreateNft}>
      <form onSubmit={createNFT}>
        <div className={classes.formHeader}>
          <h1>Create collectible</h1>
          <Link to="/">
            <CancelOutlinedIcon fontSize="large" />
          </Link>
        </div>
        <div className={classes.content}>
          <div className={classes.dropzone}>
            <DropZone onFileUploaded={setSelectedFile} />
          </div>
          <fieldset>
            <TextField
              label="Title"
              name="title"
              variant="filled"
              required
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              multiline
              rows={4}
              label="Description"
              name="description"
              variant="filled"
              required
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              variant="filled"
              required
              value={formData.price}
              onChange={handleInputChange}
              InputProps={{
                inputProps: { min: 0.01, step: 0.01 },
                startAdornment: <InputAdornment position="start">ETH</InputAdornment>,
              }}
              fullWidth
            />

            <Button variant="contained" color="primary" type="submit">
              Create NFT
            </Button>
          </fieldset>
        </div>
      </form>
    </div>
  );
};

export default CreateNFT;