// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ArtToken.sol";

contract ArtMarketplace {
    ArtToken private token;

    struct ItemForSale {
        uint256 id;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isSold;
    }

    struct Offer {
        address bidder;
        uint256 amount;
        bool accepted;
    }

    ItemForSale[] public itemsForSale;
    mapping(uint256 => bool) public activeItems; // tokenId => active?
    mapping(uint256 => Offer[]) public offers; // tokenId => offers[]

    event itemAddedForSale(uint256 id, uint256 tokenId, uint256 price);
    event itemSold(uint256 id, address buyer, uint256 price);
    event OfferMade(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event OfferAccepted(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event OfferWithdrawn(uint256 indexed tokenId, address indexed bidder, uint256 amount);

    constructor(ArtToken _token) {
        token = _token;
    }

    modifier OnlyItemOwner(uint256 tokenId) {
        require(token.ownerOf(tokenId) == msg.sender, "Sender does not own the item");
        _;
    }

    modifier HasTransferApproval(uint256 tokenId) {
        require(token.getApproved(tokenId) == address(this), "Market is not approved");
        _;
    }

    modifier ItemExists(uint256 id) {
        require(id < itemsForSale.length && itemsForSale[id].id == id, "Could not find item");
        _;
    }

    modifier IsForSale(uint256 id) {
        require(!itemsForSale[id].isSold, "Item is already sold");
        _;
    }

    // List an item for sale
    function putItemForSale(uint256 tokenId, uint256 price) 
        external 
        OnlyItemOwner(tokenId) 
        HasTransferApproval(tokenId) 
        returns (uint256) 
    {
        require(!activeItems[tokenId], "Item is already up for sale");

        uint256 newItemId = itemsForSale.length;
        itemsForSale.push(ItemForSale({
            id: newItemId,
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            isSold: false
        }));
        activeItems[tokenId] = true;

        emit itemAddedForSale(newItemId, tokenId, price);
        return newItemId;
    }

    // Buy an item directly
    function buyItem(uint256 id) 
        external 
        payable 
        ItemExists(id)
        IsForSale(id)
        HasTransferApproval(itemsForSale[id].tokenId)
    {
        require(msg.value >= itemsForSale[id].price, "Not enough funds sent");
        require(msg.sender != itemsForSale[id].seller, "Seller cannot buy their own item");

        itemsForSale[id].isSold = true;
        activeItems[itemsForSale[id].tokenId] = false;

        token.safeTransferFrom(itemsForSale[id].seller, msg.sender, itemsForSale[id].tokenId);
        itemsForSale[id].seller.transfer(msg.value);

        emit itemSold(id, msg.sender, itemsForSale[id].price);
    }

    // Make an offer on an item
    function makeOffer(uint256 tokenId) external payable {
        require(activeItems[tokenId], "Item not for sale");
        require(msg.value > 0, "Offer must be greater than 0");

        offers[tokenId].push(Offer({
            bidder: msg.sender,
            amount: msg.value,
            accepted: false
        }));

        emit OfferMade(tokenId, msg.sender, msg.value);
    }

    // Accept an offer
    function acceptOffer(uint256 tokenId, uint256 offerIndex) external OnlyItemOwner(tokenId) {
        require(offerIndex < offers[tokenId].length, "Invalid offer");
        Offer storage offer = offers[tokenId][offerIndex];
        require(!offer.accepted, "Offer already accepted");

        offer.accepted = true;
        activeItems[tokenId] = false;

        token.safeTransferFrom(msg.sender, offer.bidder, tokenId);
        payable(msg.sender).transfer(offer.amount);

        emit OfferAccepted(tokenId, offer.bidder, offer.amount);
    }

    // Withdraw an offer
    function withdrawOffer(uint256 tokenId, uint256 offerIndex) external {
        require(offerIndex < offers[tokenId].length, "Invalid offer");
        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.bidder == msg.sender, "Only bidder can withdraw");
        require(!offer.accepted, "Offer already accepted");

        payable(msg.sender).transfer(offer.amount);
        delete offers[tokenId][offerIndex];

        emit OfferWithdrawn(tokenId, msg.sender, offer.amount);
    }

    // Get total items for sale
    function totalItemsForSale() external view returns (uint256) {
        return itemsForSale.length;
    }
}