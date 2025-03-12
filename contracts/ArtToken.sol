// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtToken is ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    address public marketplace;

    struct Item {
        uint256 id;
        address creator;
        string uri;
    }

    mapping(uint256 => Item) public Items;

    constructor () ERC721("ArtToken", "ARTK") {}

    function mint(string memory uri) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, uri); // crucial if you use ERC721URIStorage
        approve(marketplace, newItemId);

        Items[newItemId] = Item({
            id: newItemId,
            creator: msg.sender,
            uri: uri
        });

        return newItemId;
    }

    // Override tokenURI to use URIStorage logic
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return super.tokenURI(tokenId);
    }

    // Required override due to multiple inheritance
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function setMarketplace(address market) public {
        marketplace = market;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
