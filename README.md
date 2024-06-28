# Charity Connect
Connecting brand charity donations to consumer activity through Interactive NFTs.

## Overview
Charity Connect gives consumers the ability to influence charity donations from brands in innovative new ways using blockchain technology.

## Market Need
- **Problem:** Current charity donation methods lack interactivity and transparency, resulting in low user engagement.
- **Target Market:** Charity donors, socially-conscious consumers, and businesses involved in charitable activities.
- **Market Potential:** With increasing social responsibility awareness and blockchain adoption, an interactive and transparent charity model holds significant growth potential.
- **User Demographics:** Younger generations, socially responsible consumers, and businesses looking to improve their brand image.

## Product/Service
- **Core Features:** 
  - A universal charity membership card (interavtive NFT) that convert user's behaviour like visting a store into donates to a charity pool and earns charity points(interavtive FT).
- **Unique Advantages:** 
  - Utilizes blockchain technology to ensure transparency and fairness in the donation process.
  - A points system incentivizes user participation in charitable activities.
  - An interavtive digital asset which turns "signing up" to "getting asset".
  - Charity membership card (interavtive NFT) and charity points (interavtive FT) can be easliy and openly integrated by any 3rd parties.

## Features and Technical Requirements

1. **QR Code Scanning and Wallet Integration**
   - Utilizes JoyID or Coinbase Smart Wallet Integration.
   - Users scan the QR code to import the charity membership card (NFT) into their wallet.
   
2. **NFT Details**
   - The NFT is a standard ERC-721 token compatible with ERC-5169.
   - Includes TokenScript for functionalities such as adding the membership card to Apple/Google Wallet and checking in at stores.

3. **Check-in Function**
   - Users can select a store and check-in.
   - The system hypothetically monitors the user’s location and time spent in the store.
   - If the user stays over 30 seconds, the check-in is recorded, and 1 point are minted to the user’s wallet.

4. **Points System and Instant Minting**
   - Implements a points system using the Base blockchain to record points (ERC20 + ERC5169 tokens).
   - During the POC phase, users click “Check-in,” sign a transaction, and the server mints 1 point to the user.

5. **Charity Pool Contribution**
   - Stores recharge the charity pool monthly based on successful check-ins.

6. **Voting Mechanism**
   - Users vote using Snapshot to decide the allocation of charity pool funds.
   - Voting weight is based on the number of points a user holds.

## User Flow

1. **QR Code Scanning and Wallet Creation**
   - Users scan the QR code, setup a PWA wallet and import the charity membership card (NFT) into their wallet.

2. **Adding the Membership Card to Apple/Google Wallet**
   - Users click the Wallet Pass button on the NFT to add the membership card to Apple/Google Wallet.

3. **Check-in Process**
   - Users click the Checkin button on the NFT
   - Users select a store and check-in.
   - The system monitors location and time spent.
   - If the stay exceeds 30 seconds, check-in is successful, 1 point are minted and allocated to the user’s wallet.
   - 
4. **Check Point**
   - Users Click the ! button on the NFT to check how many points they have.

5. **Snapshot Voting (Mock Implementation)**
   - Users click Vote for Charity Fund Allocation botton on the NFT to vote on charity pool fund allocation based on their points.

## Conclusion
This POC project demonstrates the feasibility of integrating blockchain technology with charitable donations, increasing user engagement, and providing businesses with a transparent and fair charity donation method. Simplified processes allow quick demonstration of core concepts and key features.

## Video Demo
