# Airline

Airline is a simple trading service in smartlayer network.

The simple flow:

1. the seller creates an offer for selling or transfering. Note:
   - the seller must have the correct right to do it, eg, the owner of the nft or the nft contract.
   - the nft token or contract has authorized the dvp contract to transfer the nft token.
1. the target user will be sent a token script enabled attestation, in which the target will be asked to prove that he/she is the target.
1. an id attestation will be created for the target user and it will be passed to the dvp contract with the offer to finish the trade.
