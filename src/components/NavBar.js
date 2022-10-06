import React from 'react';
import "../App.css";

const Navbar = () => {
  return (
    <nav className='nav' >
      <ul className='site-title'>
        <li>
            <a href='/'>Gift Dapp</a>
        </li>
      </ul>
      <ul>
        <li>
            <a href='/yournfts'>Your NFTs</a>    
        </li>
        <li>
            <a href='/nftmarketplace'>NFT Marketplace</a>
        </li>
        <li>
            <a href='/products'>Products</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;