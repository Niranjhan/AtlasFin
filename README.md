
The following rules are implemented to flag suspicious transaction
1. Rule: ruleHighFrequency
   Trigger : if 5 transactions are executed within 5 minutes
   Reasoning: It is unusual for 5 transactions for a user to execute within 5 minutes. A stolen card could be used by a fraud to potentially make the best use of the card before the card is frozen
2. Rule: ruleLargeAmount
   Trigger : if a transaction exceeds $10000
   Reasoning: Atlasfin user's are generally people who are unable to get regular credit card. Hence, $10000 could be a very big number for small to medium income people to spend in a single transaction and is worth investigating.
3. Rule: ruleUnknownMerchant
   Trigger : If a transaction is not made from a known merchant for AtlasFin
   Reasoning: It’s quite possible for a merchant to be a scammer, hence flagging it suspicious and triggering an investigation can help investigating the merchant
4. Rule: ruleGeographicalAnomalies
   Trigger : If a transaction is made with a merchant which is in a different city from the users city
   Reasoning: Its possible the user is not in the city, and the card was stolen to be used in a different city. This is a very naive implementation, as it could be an online transaction, or the user could be travelling, but serves as a good starting point
5. Rule: ruleInconsistentSpending
   Trigger : If a transaction is made by a user which is more than thrice the average of all transaction the user has made before
   Reasoning:The reason is similar to ruleLargeAmount but  is a more personalized to a specific user

**Steps to Execute:**
`npm install`  to install dependant packages
`npm run start`  to run the program
`npm run test` to run unit tests

