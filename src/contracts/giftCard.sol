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
    uint256 celoPrice;
    uint256 price;
    uint256 itemsAvailable;
    uint256 totalItemsSold;
    uint256 itemsSoldByNft;
    string description;
    address payable seller;
  }

  struct ListedToken{
    uint256 tokenId;
    uint8 tokenValue;
    address payable owner;
    bool forSale;
  }

  mapping(uint256 => Product) products;
  mapping(uint256 => ListedToken) listedTokens;
  mapping(uint256 => uint8) tokenValue;
  mapping(address => uint[]) tokensOfOwner;

  uint256 mintingFee = 0.1 ether;
  uint256 redeemFee = 0.1 ether;

  

  constructor() ERC721("NFT Gift card", "GC") {
    owner = payable(msg.sender);
  }

//Modifiers

  modifier onlySeller(uint _productId){
    require(
      msg.sender == products[_productId].seller,
      "only the seller can access this function"
    );
    _;
  }

  modifier tokenExists(uint _listedTokenId){
    require(
      listedTokenId.current() > _listedTokenId, 
      "does not exist"
    );
    _;
  }

  modifier productExists(uint _productId){
    require(
      productId.current() > _productId, 
      "does not exist"
    );
    _;   
  }

  modifier isValid(uint _input){
    require(
      _input > 0, 
      "invalid input"
    );
    _;
  }

  modifier onlyOwner(uint _tokenId){
    require (
      msg.sender == ownerOf(_tokenId), 
      "Not the owner"
    );
    _;
  }

  modifier correctMsgValue(uint _msgValue){
    require(
      msg.value == _msgValue, 
      "send correct value"
    );
    _;
  }

// Owner functions
  function changeFee(uint _mintingFee, uint _redeemFee) external 
    isValid(_mintingFee) isValid(_redeemFee)
  {
    mintingFee = _mintingFee;
    redeemFee = _redeemFee;
  }

//---------------------------------------------<Purely NFT>---------------------------------------------------->
  // Functions involving purely the NFT

  function mint(uint8 _value) external payable 
    correctMsgValue((_value * 1 ether) + mintingFee)
  {
    require(_value == 1 || _value == 2 ||_value == 5 || _value == 10 ||  _value == 20 );
    uint256 newId = tokenId.current();
    _mint(msg.sender, newId);
    tokenValue[newId] = _value;
    tokenId.increment();
    tokensOfOwner[msg.sender].push(newId);
  }


  function redeemCash(uint _tokenId) external payable correctMsgValue(redeemFee){
    require(_exists(_tokenId), "not exists");
    (bool success, ) = payable(msg.sender).call{value: msg.value}("");
    require(success, "Payment failed");
    _burn(_tokenId);
  }

  function giftNft(uint _tokenId, address _receiver) external{
    require(_receiver != address(0), "invalid address");
    transferFrom(msg.sender, _receiver, _tokenId);
  }

//<----------------------------------------<Listing NFT>------------------------------------------------------>

  //Functions involving Listed NFT

  function listNft(uint _tokenId) external onlyOwner(_tokenId){
    listedTokens[listedTokenId.current()] = ListedToken(
      _tokenId,
      tokenValue[_tokenId],
      payable(msg.sender),
      true
    );
    listedTokenId.increment();
  }

  function buyNft(uint _listedTokenId) external payable 
    tokenExists(_listedTokenId) correctMsgValue(tokenValue[listedTokens[_listedTokenId].tokenId])
  {
    ListedToken storage listedToken = listedTokens[_listedTokenId];
    require(msg.sender != listedToken.owner, "Owner can't buy NFT");

    (bool success, ) = listedToken.owner.call{value: msg.value}("");
    require(success, "Payment failed");

    listedTokens[_listedTokenId].forSale = false;
    _transfer(listedTokens[_listedTokenId].owner, msg.sender, listedTokens[_listedTokenId].tokenId);
  }

  function unListNft(uint _listedTokenId) external 
    onlyOwner(listedTokens[_listedTokenId].tokenId) tokenExists(_listedTokenId)
  {
    listedTokens[_listedTokenId].forSale = false;
  }


//<------------------------------------------<Product side>--------------------------------------------------->

  function addProduct(
    uint _price, 
    uint _celoPrice, 
    string calldata _description, 
    uint _quantity
    ) external
  {
    require(_price < _celoPrice, "price for NFT transfer should be low");
    require(_price == 1 || _price == 2 ||_price == 5 || _price == 10  ||  _price == 20 );
    products[productId.current()] = Product(
      _celoPrice,
      _price,
      _quantity,
      0,
      0,
      _description,
      payable(msg.sender)
    );
    productId.increment();
  }

  function buyWithCelo(uint _productId) public payable 
    correctMsgValue(products[_productId].celoPrice)
  {
    Product storage currentProduct = products[_productId];
    (bool success, ) = currentProduct.seller.call{value: msg.value}("");
    require(success, "Payment failed");    
    products[_productId].seller.transfer(msg.value);
    products[_productId].totalItemsSold++;
    products[_productId].itemsAvailable--;
  }

  function buyWithNft(uint _productId, uint _tokenId) public {
    Product storage currentProduct = products[_productId];
    require(tokenValue[_tokenId] == products[_productId].price);
    transferFrom(msg.sender, products[_productId].seller, _tokenId);
    products[_productId].totalItemsSold++;
    products[_productId].itemsSoldByNft++;
    if(currentProduct.itemsSoldByNft % 3  == 0){
      (bool success, ) = currentProduct.seller.call{value: mintingFee}("");
      require(success, "payment Failed");
    }
    products[_productId].itemsAvailable--;
  }

  function changePrice(uint _productId, uint _price) external onlySeller(_productId) isValid(_price){
    products[_productId].price = _price;
  }

  function addQuantity(uint _productId, uint _quantity) external onlySeller(_productId) isValid(_quantity){
    products[_productId].itemsAvailable += _quantity;
  }

//<----------------------------------View Functions------------------------------------------------------------->

  function getFee() external view returns(uint _mintingFee){
    return mintingFee;
  }
  function getTokenValue(uint256 _tokenId) external view returns (uint8){
    return tokenValue[_tokenId];
  }

  function getTokenId() external view returns(uint){
    return tokenId.current();
  }

  function getProductId() external view returns(uint){
    return productId.current();
  }

  function getListedTokenId()external view returns(uint){
    return listedTokenId.current();
  }

  function getTokensOfOwner() external view returns(uint[] memory){
    return tokensOfOwner[msg.sender];
  }

  function getProduct(uint _productId) external productExists(_productId) view 
    returns(
      uint price, 
      uint celoPrice, 
      string memory description, 
      address seller
    )
  {
    return(
        products[_productId].price,
        products[_productId].celoPrice,
        products[_productId].description,
        products[_productId].seller
    );
  }

  function getListedToken(uint _listedTokenId) external view 
    returns(
      uint _tokenId, 
      uint8 _tokenValue, 
      address _owner, 
      bool _forSale
    )
  {
    return(
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