import React from 'react';
import "../styles/App.css";

const Navbar = () => {
  return (
    <nav className='nav' >
      <ul className='site-title'>
        <li>
            <a href='/'>Value NFT</a>
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
        <li>
          <h5>Network: Celo Alfajores</h5>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;