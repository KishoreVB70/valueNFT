// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract gifterContract is ERC721, ERC721URIStorage,ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter tokenId;
  Counters.Counter productId;

  Counters.Counter listedTokenId;

  address payable owner;
  struct Product{
    uint256 productIndex;
    uint256 celoPrice;
    uint256 price;
    uint256 itemsAvailable;
    uint256 totalItemsSold;
    uint256 itemsSoldByNft;
    string name;
    string description;
    address payable seller;
  }

  struct ListedToken{
    uint256 listedIndex;
    uint256 tokenId;
    uint256 tokenValue;
    address payable owner;
    bool forSale;
  }

  mapping(uint256 => Product) products;
  mapping(uint256 => ListedToken) listedTokens;
  mapping(uint256 => uint256) tokenValue;
  mapping(address => uint256[]) tokensOfOwner;
  mapping(uint256 => bool) hasListed;

  uint256 mintingFee = 0.1 ether;
  uint256 redeemFee = 0.1 ether;

  constructor() ERC721("NFT Gift card", "GC") {
    owner = payable(msg.sender);
  }

//Modifiers
  modifier tokenExists(uint256 _listedTokenId){
    require(
      listedTokenId.current() > _listedTokenId, 
      "does not exist"
    );
    _;
  }


  modifier isValid(uint256 _input){
    require(
      _input > 0, 
      "invalid input"
    );
    _;
  }

  modifier onlyOwner(uint256 _tokenId){
    require (
      msg.sender == ownerOf(_tokenId), 
      "Not the owner"
    );
    _;
  }

  modifier correctMsgValue(uint256 _msgValue){
    require(
      msg.value == _msgValue, 
      "send correct value"
    );
    _;
  }

// Product modifiers
  modifier productExists(uint256 _productId){
    require(
      productId.current() > _productId, 
      "does not exist"
    );
    _;   
  }

  modifier onlySeller(uint256 _productId){
    require(
      msg.sender == products[_productId].seller,
      "only the seller can access this function"
    );
    _;
  }

  modifier notSeller(uint256 _productId){
    require(
      msg.sender != products[_productId].seller,
      "Owner cannot buy"
    );
    _;
  }

// Owner functions
  function changeFee(uint256 _mintingFee, uint256 _redeemFee) external 
    isValid(_mintingFee) isValid(_redeemFee)
  {
    mintingFee = _mintingFee;
    redeemFee = _redeemFee;
  }

//---------------------------------------------<Purely NFT>---------------------------------------------------->
  // Functions involving purely the NFT

  function mint(uint256 _value) external payable 
    correctMsgValue((_value * 1 ether) + mintingFee)
  {
    require(_value == 1 || _value == 2 ||_value == 5 || _value == 10 ||  _value == 20 );
    uint256 newId = tokenId.current();
    _mint(msg.sender, newId);
    tokenValue[newId] = _value * 1 ether;
    tokenId.increment();
    tokensOfOwner[msg.sender].push(newId);
  }


  function redeemCash(uint256 _tokenId) external payable 
  correctMsgValue(redeemFee)
  onlyOwner(_tokenId)
  {
    require(_exists(_tokenId), "not exists");
    require(ownerOf(_tokenId) == msg.sender, "not owner");
    uint value = tokenValue[_tokenId];
    (bool success, ) = payable(msg.sender).call{value: value}("");
    require(success, "Payment failed");
    _burn(_tokenId);

    //Remove token from user array
  }

  function giftNft(uint256 _tokenId, address _receiver) external onlyOwner(_tokenId){
    require(_receiver != address(0), "invalid address");
    transferFrom(msg.sender, _receiver, _tokenId);
    tokensOfOwner[_receiver].push(_tokenId);
    //Remove token from user
  }

//<----------------------------------------<Listing NFT>------------------------------------------------------>

  //Functions involving Listed NFT

  function listNft(uint256 _tokenId) external onlyOwner(_tokenId){
    require(!hasListed[_tokenId], "already listed");
    listedTokens[listedTokenId.current()] = ListedToken(
      listedTokenId.current(),
      _tokenId,
      tokenValue[_tokenId],
      payable(msg.sender),
      true
    );
    hasListed[_tokenId] = true;
    listedTokenId.increment();
  }

  function buyNft(uint256 _listedTokenId) external payable 
    tokenExists(_listedTokenId) 
    correctMsgValue(listedTokens[_listedTokenId].tokenValue)
  {
    ListedToken storage listedToken = listedTokens[_listedTokenId];
    require(msg.sender != listedToken.owner, "Owner can't buy NFT");

    (bool success, ) = listedToken.owner.call{value: msg.value}("");
    require(success, "Payment failed");

    listedToken.forSale = false;
    hasListed[listedToken.tokenId] = false;
    tokensOfOwner[msg.sender].push(listedToken.tokenId);

    //Delete token from the user

    _transfer(listedToken.owner, msg.sender, listedToken.tokenId);
  }

  function unListNft(uint256 _listedTokenId) external 
    onlyOwner(listedTokens[_listedTokenId].tokenId) tokenExists(_listedTokenId)
  {
    listedTokens[_listedTokenId].forSale = false;
    hasListed[listedTokens[_listedTokenId].tokenId] = false;
  }


//<------------------------------------------<Product side>--------------------------------------------------->

  function addProduct(
    uint256 _price, 
    uint256 _celoPrice, 
    string calldata _name,
    string calldata _description, 
    uint256 _quantity
    ) external
  {
    require(_price < _celoPrice, "price for NFT transfer should be low");
    require(_price == 1 || _price == 2 ||_price == 5 || _price == 10  ||  _price == 20 );
    products[productId.current()] = Product(
      productId.current(),
      _celoPrice,
      _price,
      _quantity,
      0,
      0,
      _name,
      _description,
      payable(msg.sender)
    );
    productId.increment();
  }

  function buyWithCelo(uint256 _productId) public payable 
    correctMsgValue(products[_productId].celoPrice)
    notSeller(_productId)
  {
    Product storage currentProduct = products[_productId];
    (bool success, ) = currentProduct.seller.call{value: msg.value}("");
    require(success, "Payment failed");    
    products[_productId].totalItemsSold++;
    products[_productId].itemsAvailable--;
  }

  function buyWithNft(uint256 _productId, uint256 _tokenId) public notSeller(_productId) {
    Product storage currentProduct = products[_productId];
    require(tokenValue[_tokenId] == products[_productId].price, "not correct nft");

    transferFrom(msg.sender, products[_productId].seller, _tokenId);
    products[_productId].totalItemsSold++;
    products[_productId].itemsSoldByNft++;
    
    if(currentProduct.itemsSoldByNft % 3  == 0){
      (bool success, ) = currentProduct.seller.call{value: mintingFee}("");
      require(success, "payment Failed");
    }
    products[_productId].itemsAvailable--;
  }

  function changePrice(uint256 _productId, uint256 _price) external onlySeller(_productId) isValid(_price){
    products[_productId].celoPrice = _price;
  }

  function addQuantity(uint256 _productId, uint256 _quantity) external onlySeller(_productId) isValid(_quantity){
    products[_productId].itemsAvailable += _quantity;
  }

//<----------------------------------View Functions------------------------------------------------------------->

  function getmintingFee() external view returns(uint256){
    return mintingFee;
  }
  function getredeemFee() external view returns(uint256){
    return redeemFee;
  }

  function getTokenId() external view returns(uint256){
    return tokenId.current();
  }

  function getProductId() external view returns(uint256){
    return productId.current();
  }

  function getListedTokenId()external view returns(uint256){
    return listedTokenId.current();
  }

  function getTokensOfOwner() external view returns(uint256[] memory){
    return tokensOfOwner[msg.sender];
  }

  function getTokenValue(uint256 _tokenId) external view returns (uint256 token, uint256 value){
    return (
      _tokenId,
      tokenValue[_tokenId]
    );
  }


  function getProduct(uint256 _productId) external productExists(_productId) view 
    returns(
      uint256 productIndex,
      uint256 price, 
      uint256 celoPrice, 
      string memory name, 
      string memory description, 
      address seller
    )
  {
    return(
        products[_productId].productIndex,
        products[_productId].price,
        products[_productId].celoPrice,
        products[_productId].name,
        products[_productId].description,
        products[_productId].seller
    );
  }

  function getListedToken(uint256 _listedTokenId) external view 
    returns(
      uint256 _listedIndex,
      uint256 _tokenId, 
      uint256 _tokenValue, 
      address _owner, 
      bool _forSale
    )
  {
    return(
      listedTokens[_listedTokenId].listedIndex,
      listedTokens[_listedTokenId].tokenId,
      listedTokens[_listedTokenId].tokenValue,
      listedTokens[_listedTokenId].owner,
      listedTokens[_listedTokenId].forSale
    );
  }

//<----------------------------------overrides required by Solidity-------------------------------------------->

    /**
     * @dev See {IERC721-transferFrom}.
     * Changes is made to transferFrom to prevent the renter from stealing the token
     */
    function transferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public override {
        super.transferFrom(from, to, _tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * Changes is made to safeTransferFrom to prevent the renter from stealing the token
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory data
    ) public override {
        _safeTransfer(from, to, _tokenId, data);
    }

    function _burn(uint256 _tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(_tokenId);
    }
}