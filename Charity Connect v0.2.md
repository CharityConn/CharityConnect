# Charity Connect v0.2
Connecting brand charity donations to consumer activity.

## Overview
Charity Connect is a tapp which gives consumers the ability to donate and influence charity donations from brands.

## Market Need
- **Problem:** Current charity donation methods lack interactivity and transparency, resulting in low user engagement.
- **Target Market:** Charity donors, socially-conscious consumers, and businesses involved in charitable activities.
- **Market Potential:** charitable donations is a 4.2 billion people and $1.8 trillion market. With increasing social responsibility awareness and blockchain adoption, an interactive and transparent charity model holds significant growth potential.
- **User Demographics:** Younger generations, socially responsible consumers, and businesses looking to improve their brand image.

## Key Components
![Charity Connect Value Flow - Model](https://github.com/user-attachments/assets/6441c298-41a1-4659-9dca-ec343a6c6326)

### 1. Charity Connect Membership Card (ERC721 tapp)
- Claimable NFT representing membership in the Charity Connect ecosystem
- Implement as an ERC721 token with ERC5169 to have tapp functionality
- Includes QR code generation and wallet pass integration
- Implement ERC6551 to hold the CHARITYeet Token

### 2. CHARITYeet (ERC20 tapp)
- Earned through donations, redeemable for rewards or further donations
- Implement as an ERC20 token with ERC5169 to have tapp functionality
- Minted to the Charity Connect Membership NFT's 6551 wallet

### 3. Donation Mechanism
- Accept native ETH donations on the Base blockchain, with supporting ERC 20 in future. 
- Convert donation amount to USD for CHARITYeet calculation, might need to implement ChainLink oracle (apply grant) 
- Mint CHARITYeet tokens to donor's Membership NFT's 6551 wallet

### 4. Fee Structure
- 0.50% fee on each donation, directed to Charity Connect Pool
- Implement adjustable fee percentage via governance

### 5. CHARITYeet Minting
- Base rate: 2.5 CHARITYeet per 1 USD worth of ETH donated
- Support variable minting rates based on charity, time, or donation currency

### 6. QR Code and Wallet Pass Integration
- Generate QR code for easy verification of membership
- Support for both Google Wallet and Apple Wallet pass generation

### 7. Redemption(burn) Mechanism
- Allow burning of CHARITYeet for rewards or additional donations
- Implement burn functionality in the CHARITYeet smart contract

### 8. Governance
- Decentralized voting for fee adjustment and CHARITYeet minting rate changes
- and other proposal 

### 9. Leaderboard
- Track and display ETH donated per membership NFT ID (not per user/wallet)

## Smart Contract Architecture

1. CharityMembershipCard (ERC721,5169,6551)
2. CHARITYeet (ERC20,5169)
3. DonationManager, DvP contract (ETH/ERC20 v CHARITYeet)
4. GovernanceContract

## Key Functions to Implement

1. claimMembershipCard()
2. donate(address charityAddress, uint256 amount)
3. redeemCHARITYeet(uint256 amount, address beneficiary)
4. proposeRateChange(uint256 newRate)
5. vote(uint256 proposalId, bool support)
6. executeProposal(uint256 proposalId)
7. updateMintingRate(address charity, uint256 newRate)
8. getLeaderboard() (off-chain with on-chain data)
9. generateQRCode(uint256 tokenId)
10. generateGoogleWalletPass(uint256 tokenId)
11. generateAppleWalletPass(uint256 tokenId)

## Tapp Functionality
- Implement ERC5169 for both token types
- Develop TokenScript or similar for rich token interfaces
- Enable cross-platform functionality (wallets, websites, apps)

## User Flow

1. User claims Charity Membership Card (ERC721 tapp)
2. User can view their membership card as a QR code
3. User can generate and install Google or Apple Wallet passes
4. User donates ETH via Charity Connect
5. User receives CHARITYeet tokens based on donation amount
6. User can redeem(burn), transfer, or trade CHARITYeet tokens
7. User can participate in governance decisions
8. Leaderboard updates to reflect user's donations

## User Interface Updates

1. Replace "Wallet Pass" button with "Show as QR code" button
2. QR Code Display:
   - Show QR code prominently when "Show as QR code" is clicked
   - Include user's membership details in human-readable format alongside QR code
3. Wallet Pass Options:
   - Add "Generate Google Wallet Pass" button
   - Add "Generate Apple Wallet Pass" button
4. Provide clear instructions for users on how to install generated passes on their phones

## Technical Specifications

- Blockchain: Base (Ethereum L2)
- Token Standards: ERC721 (Membership Card), ERC20 (CHARITYeet)
- Additional Standards: ERC5169 for tapp functionality, 6551 for NFT wallet
- Smart Contract Language: Solidity
- Frontend: Web3-enabled application (specific framework TBD)
- Indexing: The Graph or similar for efficient data querying
- QR Code Generation: Server-side or client-side library (e.g., qrcode.js)
- Wallet Pass Generation:
  - Google Wallet API integration
  - Apple Wallet API integration

## Integration Requirements

1. Google Wallet API:
   - Set up Google Pay API for Passes
   - Implement JWT (JSON Web Token) generation for Google Wallet passes
   - Handle pass updates and notifications

2. Apple Wallet API:
   - Obtain Apple Developer account and configure for Wallet passes
   - Implement .pkpass file generation
   - Set up pass type identifier and certificates

3. QR Code Generation:
   - Choose between server-side or client-side generation based on security and performance requirements
   - Ensure QR codes contain necessary information for membership verification

## Development Guidelines

1. Use OpenZeppelin for standard token implementations
2. Implement thorough testing, especially for financial calculations
3. Conduct security audits before mainnet deployment
4. Implement upgradeability patterns for future improvements
5. Use events for all significant state changes
6. Optimize for gas efficiency, especially in frequently used functions
7. Ensure secure generation and display of QR codes to prevent spoofing
8. Implement proper error handling for wallet pass generation and installation processes
9. Consider caching mechanisms for QR codes to improve performance

## Security Considerations

1. Implement rate limiting for QR code and wallet pass generation to prevent abuse
2. Ensure that wallet passes contain only necessary information to protect user privacy
3. Use secure, token-based authentication for API calls to wallet pass generation endpoints
4. Regularly rotate encryption keys used for pass generation
5. Implement a system to revoke or update wallet passes if needed (e.g., in case of security issues)

## Future Considerations

1. Support for ERC20 token donations (e.g., USDC)
2. Integration with more blockchains
3. Enhanced tapp functionalities for both token types
4. Integration with popular wallet providers and platforms
5. Expansion of QR code functionality (e.g., dynamic QR codes for specific events or campaigns)
6. Advanced analytics for tracking donation impact and user engagement

## Conclusion

This documentation provides a comprehensive guide for developers to implement the new version of Charity Connect. It combines blockchain technology with user-friendly features like QR codes and digital wallet passes to create an engaging and transparent charitable donation platform. Developers should pay close attention to security considerations, especially regarding the generation and management of QR codes and wallet passes.
