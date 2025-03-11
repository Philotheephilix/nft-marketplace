'use client'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import type { NextPage } from 'next';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Marketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json';
import { NFT as NFTType } from './types/nft';

const Home: NextPage = () => {
  const [nfts, setNfts] = useState<NFTType[]>([]);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string>('');

  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;
  const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!;

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) setAccount(accounts[0]);
        
        const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, provider);
        const response = await fetch('/api/nfts');
        const nftMetadata: NFTType[] = await response.json();
        
        const listedNFTs = await Promise.all(nftMetadata.map(async (nft) => {
          const listing = await marketplace.listings(NFT_CONTRACT_ADDRESS, nft.tokenId);
          return {
            ...nft,
            price: listing.price.toString(),
            seller: listing.seller,
            active: listing.active
          };
        }));
        
        setNfts(listedNFTs.filter(nft => nft.active));
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await provider!.listAccounts();
    setAccount(accounts[0]);
  };

  // ... (buyNFT and makeOffer functions remain similar with TypeScript types)

  return (
    <div>
      {/* ... existing home page UI */}
    </div>
  );
};

export default Home;