# Charity Connect v0.2
<img width="631" alt="Logo (3)" src="https://github.com/user-attachments/assets/c56d961c-2e5c-41a7-8638-a5c992f716fd">

## Overview
Charity Connect is a tapp designed to bridge the gap between donors, charities, and brands. Donors earn reward points for their contributions, which can be redeemed for rewards from participating merchants who support charitable causes and social good.

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
- Contract need to record how much ETH a membership card has donated.
  (need to records ERC20 next version)
- Action 1, Quick Donate: donate 0.001 ETH to a random Charity with one click
- Action 2, Choose to Donate: choose a charity and input an ETH amount to donate
(USD$ amount in next version)
- Action 3, Show as QR: QR code generation and wallet pass integration
- more (Vote and Leader board)
- Information: This is your Charity Connect Membership Card, represented as an ERC-721 NFT tapp. Show CHARITYeet balance, and ETH Donated
(Show USD$ Donated in next version)
![image](https://github.com/user-attachments/assets/d22c14ff-fabe-48b3-826e-bcc8d0ecb997)

### 2. CHARITYeet (ERC20 tapp) token symbol is CHTY.
- Earned through donations, redeemable for rewards or further donations
- Implement as an ERC20 token with ERC5169 to have tapp functionality
- Mint to the current Membership Card holder
- Minting rate start with 2.5x 3000 x ETH donated, adjustable and can be different based on different token different time different "to charity".
- Allow burning of CHARITYeet for rewards or additional donations
(a user controled burnTo function) 

### 3. Donation Mechanism
- Accept native ETH donations on the Base blockchain, with supporting ERC 20 in future. 
- Convert donation amount to ETH for CHARITYeet calculation, ( might need to implement ChainLink oracle (apply grant) )
- Mint CHARITYeet tokens to donor's wallet
- Minting rate start with 2.5 x 3000 x ETH donated, adjustable and can be different based on different token different time different "to charity".

### 4. Fee Structure
- 0.50% fee on each donation, directed to Charity Connect Pool
- Implement adjustable fee percentage via governance （in next version）

### 5. CHARITYeet Minting
- Base rate: 2.5x3000 CHARITYeet per 1 ETH donated
- Support variable minting rates based on charity, time, or donation currency

### 6. QR Code and Wallet Pass Integration
- Generate QR code for easy verification of membership
- Support for both Google Wallet and Apple Wallet pass generation

### 7. Redemption(burn) Mechanism
- Allow burning of CHARITYeet for rewards or additional donations
(a user controled burnTo function)  
- Implement burn functionality in the CHARITYeet smart contract or DvP Contract/s

### 8. Governance
- Decentralized voting for fee adjustment and CHARITYeet minting rate changes
- and other proposal 

### 9. Leaderboard
- Track and display ETH donated per membership NFT ID (not per user/wallet)

## Smart Contract Architecture

1. CharityMembershipCard (ERC721,5169)
2. CHARITYeet (ERC20,5169)
3. DonationManager, DvP contract (ETH/ERC20 v CHARITYeet)
4. GovernanceContract


## Tapp Functionality
- Implement ERC5169 for both token types
- Develop TokenScript or similar for rich token interfaces
- Enable cross-platform functionality (wallets, websites, apps)

## User Flow

![Charity Connect Value Flow - UI](https://github.com/user-attachments/assets/be3e64e7-214a-485a-91be-cec231515ac8)

1. User claims Charity Membership Card (ERC721 tapp)
2. User can view their membership card as a QR code
3. User can generate and install Google or Apple Wallet passes
4. User donates ETH via Charity Connect
5. User receives CHARITYeet tokens based on donation amount
6. User can redeem(burn), transfer, or trade CHARITYeet tokens
7. User can participate in governance decisions
8. Leaderboard updates to reflect each membership card's donations

## User Interface Updates

1. new logo and UI (with powered by Coinbase and Smart Layer) https://github.com/CharityConn/CharityConnect/tree/main/Brand%20Asset
2. new actions
3. Provide clear instructions for users on each step

## Technical Specifications

- Blockchain: Base (Ethereum L2)
- Token Standards: ERC721 (Membership Card), ERC20 (CHARITYeet)
- Additional Standards: ERC5169 for tapp functionality
- Smart Contract Language: Solidity
- Frontend: Web3-enabled application (specific framework TBD)
- Indexing: The Graph or similar for efficient data querying
- QR Code Generation: Server-side or client-side library (e.g., qrcode.js)
- Wallet Pass Generation:
  - Google Wallet API integration
  - Apple Wallet API integration

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
