import React from 'react';

const Navbar = () => {
  return (
    <div>
      <ul className='hidden md:flex'>
        <li>
            <a href='/'>Home</a>
        </li>
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
    </div>
  );
};

export default Navbar;