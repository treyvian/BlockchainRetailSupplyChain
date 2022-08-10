# Supply chain Smart Contract deployed on IOTA 2.0

Project for the Blockchain and cryptocurrency exam. The project consist in the creation of a smart contract for managing a very compact supply chain. The deployment is done on the IOTA 2.0 testnet, available at the moment of writing. The idea behind the implementation comes from the [Colnago](https://www.colnago.com/stories/colnago-first-bicycle-manufacturer-to-adopt-blockchain) announcement, where products with a unique identifiers can be tracked across the supply chain using blockchain technology. The smart contract present in this repo, tries to provide a possible solution in a very simplified manner, allowing to track a product from the manufacturer to the client and being able at every step to verify its origin.

## Problems in Existing System
---

- Currently tracking, selling, purchasing of product in traditional systems can not be trusted.

- Blockchain can solve this by providing immutable and verifiable data sources

## What this project provide?
---

An implementation of a smart contract for storing the product details across the supply chain and verifying the authenticity of that product during every step.

## Included Components

---

- Solidity (Ethereum language)
- Metamask (Ethereum wallet)
- Web3JS

## Prerequisites

---

- Nodejs v18.0 or above
- Solidity v0.8.0 or above
- [Metamask](https://metamask.io) set with the IOTA testnet network  

## Deployment Steps

---

Load the smart contracts on Remix (which is supported by IOTA) compile and deploy them to the IOTA testnet. See the [IOTA smart contract wiki](https://wiki.iota.org/smart-contracts/overview) for more details

Clone the repository locally and move into it

```bash
git clone https://github.com/treyvian/BlockchainRetailSupplyChain.git
cd RetailSupplyChainEthereum/
```

Copy the address on which the contract is deployed and past it in the file **src/js/app.js** in the **deployedAddress** variable.

start the front end by running:

```bash
npm run dev
```

Interact with the smart contract via the web page

## This application supports three roles for an account

---

- Owner
- Manufacturer
- Retailer

**Owner of the contract :** it is the which execute the transaction to deploy the contract. It is basically a super-user, it can add Roles to  other accounts can remove product from memory and execute every action available in the front end of the application.

**Manufacturer :** It has the ability to create new product and store them in memory

**Retailer :** It can buy products directly from the Manufacturer and resell them to the general public.

Every other account that has no role, can only buy products sold by the Retailers.


#### In this application we have two stages
---

1. Retailer
2. Customer

**Retailer :** Retailer sells the product to the customer.

**Customer :** Once received pays the amount to the retailer. Also can view the tracking history.

**Transport Agent :** The transport agent updates the destination address , once the product is reached to the customer.
