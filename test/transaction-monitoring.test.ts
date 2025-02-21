import { loadTransactions, loadknownMerchants, ruleHighFrequency, ruleLargeAmount, ruleUnknownMerchant, ruleInconsistentSpending, ruleGeographicalAnomalies } from '../src/risk-utils';
import { Transaction, User } from '../src/common';
const { expect, assert } = require("chai");

// Mock Transaction Data for testing


describe('risk-utils unit tests', () => {
    

    it('loadTransactions: should loadTransactions', async function() {
        const { transactions, userTransactions } = await loadTransactions((`${__dirname}/../src/transactions.csv`))
        expect(transactions.length).to.equal(39)
        expect(transactions[0].userId).to.equal("U001")
        expect(transactions[0].timestamp).to.equal("2025-02-19 10:00:00")
        expect(transactions[0].merchantName).to.equal("Amazon")
        expect(transactions[0].amount).to.equal(500)
        expect(userTransactions.size).to.equal(6)
        expect(userTransactions.get("U005")?.length).to.equal(3)
    });


    it('ruleHighFrequency: should flag users with more than 5 transactions within 5 minutes', () => {
        const userTransactions = getMockUserTransactions()
        const flagged = ruleHighFrequency(userTransactions);
        expect(flagged.size).to.equal(5)
        expect(Array.from(flagged.values())).to.members(['T018', 'T019', 'T020', 'T021', 'T022']); // These indices should be flagged for high frequency
    });

    it('ruleLargeAmount: should flag transactions with large amounts', () => {
        const transactions = getMockTransactions()
        const flagged = ruleLargeAmount(transactions);
        expect(Array.from(flagged.values())).to.include.members(['T019']); 
    });

    it('ruleUnknownMerchant: should flag transactions to unknown with large amounts', async() => {
        const transactions = getMockTransactions()
        const knownMerchants = await loadknownMerchants(`${__dirname}/../src/known-merchants.csv`)
        const flagged = ruleUnknownMerchant(transactions, knownMerchants);
        expect(flagged.size).to.equal(1)
    });

    it('ruleInconsistentSpending: should not flag anything since location is not provided', () => {
      const flagged = ruleInconsistentSpending(getMockUserTransactions2(), getMockUserDetails());
      expect(flagged.size).to.equal(1)
      expect(flagged.has('T002')).to.be.true
    });

     it('ruleGeographicalAnomalies: should  flag a transaction by a user whose location is different from merchants location', () => {
      const flagged = ruleGeographicalAnomalies(getMockUserTransactions2(), getMockUserDetails(), getMockMerchantData());
      expect(flagged.size).to.equal(1)
      expect(flagged.has('T001')).to.be.true
    });
});




function getMockTransactions(): Transaction[] {
    const transactions: Transaction[] = [
        { transactionId: "T001", userId: "U001", timestamp: "2025-02-19 10:00:00", merchantName: "Amazon", amount: 500 },
        { transactionId: "T002", userId: "U002", timestamp: "2025-02-19 10:05:00", merchantName: "Walmart", amount: 120 },
        { transactionId: "T003", userId: "U003", timestamp: "2025-02-19 10:10:00", merchantName: "Target", amount: 300 },
        { transactionId: "T004", userId: "U001", timestamp: "2025-02-19 10:15:00", merchantName: "BestBuy", amount: 1500 },
        { transactionId: "T005", userId: "U002", timestamp: "2025-02-19 10:20:00", merchantName: "Amazon", amount: 500 },
        { transactionId: "T006", userId: "U004", timestamp: "2025-02-19 10:30:00", merchantName: "Apple Store", amount: 10000 },
        { transactionId: "T007", userId: "U001", timestamp: "2025-02-19 10:35:00", merchantName: "Walmart", amount: 200 },
        { transactionId: "T008", userId: "U003", timestamp: "2025-02-19 10:40:00", merchantName: "Target", amount: 350 },
        { transactionId: "T009", userId: "U002", timestamp: "2025-02-19 10:50:00", merchantName: "BestBuy", amount: 1800 },
        { transactionId: "T010", userId: "U005", timestamp: "2025-02-19 10:55:00", merchantName: "Amazon", amount: 250 },
        { transactionId: "T011", userId: "U003", timestamp: "2025-02-19 11:00:00", merchantName: "Apple Store", amount: 5000 },
        { transactionId: "T012", userId: "U001", timestamp: "2025-02-19 11:05:00", merchantName: "BestBuy", amount: 300 },
        { transactionId: "T013", userId: "U004", timestamp: "2025-02-19 11:10:00", merchantName: "Target", amount: 450 },
        { transactionId: "T014", userId: "U002", timestamp: "2025-02-19 11:15:00", merchantName: "Apple Store", amount: 8000 },
        { transactionId: "T015", userId: "U001", timestamp: "2025-02-19 11:20:00", merchantName: "Target", amount: 120 },
        { transactionId: "T016", userId: "U003", timestamp: "2025-02-19 11:25:00", merchantName: "Walmart", amount: 950 },
        { transactionId: "T017", userId: "U006", timestamp: "2025-02-19 11:30:00", merchantName: "Target", amount: 450 },
        { transactionId: "T018", userId: "U003", timestamp: "2025-02-19 11:35:00", merchantName: "Amazon", amount: 500 },
        { transactionId: "T019", userId: "U003", timestamp: "2025-02-19 11:36:00", merchantName: "Amazon", amount: 20000 },
        { transactionId: "T020", userId: "U003", timestamp: "2025-02-19 11:37:00", merchantName: "Amazon", amount: 500 },
        { transactionId: "T021", userId: "U003", timestamp: "2025-02-19 11:38:00", merchantName: "Amazon", amount: 500 },
        { transactionId: "T022", userId: "U003", timestamp: "2025-02-19 11:39:00", merchantName: "Amazon", amount: 500 },
        { transactionId: "T023", userId: "U002", timestamp: "2025-02-19 11:40:00", merchantName: "Walmart", amount: 180 },
        { transactionId: "T024", userId: "U001", timestamp: "2025-02-19 11:45:00", merchantName: "Target", amount: 700 },
        { transactionId: "T025", userId: "U005", timestamp: "2025-02-19 11:50:00", merchantName: "Apple Store", amount: 1000 },
        { transactionId: "T026", userId: "U004", timestamp: "2025-02-19 11:55:00", merchantName: "Amazon", amount: 3000 },
        { transactionId: "T027", userId: "U001", timestamp: "2025-02-19 12:00:00", merchantName: "Amazon", amount: 550 },
        { transactionId: "T028", userId: "U006", timestamp: "2025-02-19 12:05:00", merchantName: "BestBuy", amount: 2000 },
        { transactionId: "T029", userId: "U003", timestamp: "2025-02-19 12:10:00", merchantName: "BestBuy", amount: 2100 },
        { transactionId: "T030", userId: "U002", timestamp: "2025-02-19 12:15:00", merchantName: "Target", amount: 250 },
        { transactionId: "T031", userId: "U004", timestamp: "2025-02-19 12:20:00", merchantName: "BestBuy", amount: 1300 },
        { transactionId: "T032", userId: "U001", timestamp: "2025-02-19 12:25:00", merchantName: "Walmart", amount: 800 },
        { transactionId: "T033", userId: "U005", timestamp: "2025-02-19 12:30:00", merchantName: "Apple Store", amount: 1500 },
        { transactionId: "T034", userId: "U003", timestamp: "2025-02-19 12:35:00", merchantName: "Amazon", amount: 950 },
        { transactionId: "T035", userId: "U002", timestamp: "2025-02-19 12:40:00", merchantName: "Amazon", amount: 1300 },
        { transactionId: "T036", userId: "U004", timestamp: "2025-02-19 12:45:00", merchantName: "Target", amount: 500 },
        { transactionId: "T037", userId: "U003", timestamp: "2025-02-19 12:50:00", merchantName: "Walmart", amount: 180 },
        { transactionId: "T038", userId: "U003", timestamp: "2025-03-19 12:50:00", merchantName: "scam merchant", amount: 2000 },
      ];      
    return transactions
}

function getMockUserTransactions(): Map<string, Transaction[]> {
    const userTransactions = new Map<string, any[]>([
        ["U001", [
          { transactionId: "T001", userId: "U001", timestamp: "2025-02-19 10:00:00", merchantName: "Amazon", amount: 500 },
          { transactionId: "T004", userId: "U001", timestamp: "2025-02-19 10:15:00", merchantName: "BestBuy", amount: 1500 },
          { transactionId: "T007", userId: "U001", timestamp: "2025-02-19 10:35:00", merchantName: "Walmart", amount: 200 },
          { transactionId: "T012", userId: "U001", timestamp: "2025-02-19 11:05:00", merchantName: "BestBuy", amount: 300 },
          { transactionId: "T015", userId: "U001", timestamp: "2025-02-19 11:20:00", merchantName: "Target", amount: 120 },
          { transactionId: "T027", userId: "U001", timestamp: "2025-02-19 12:00:00", merchantName: "Amazon", amount: 550 },
          { transactionId: "T024", userId: "U001", timestamp: "2025-02-19 11:45:00", merchantName: "Target", amount: 700 },
          { transactionId: "T032", userId: "U001", timestamp: "2025-02-19 12:25:00", merchantName: "Walmart", amount: 800 }
        ]],
        ["U002", [
          { transactionId: "T002", userId: "U002", timestamp: "2025-02-19 10:05:00", merchantName: "Walmart", amount: 120 },
          { transactionId: "T005", userId: "U002", timestamp: "2025-02-19 10:20:00", merchantName: "Amazon", amount: 500 },
          { transactionId: "T009", userId: "U002", timestamp: "2025-02-19 10:50:00", merchantName: "BestBuy", amount: 1800 },
          { transactionId: "T014", userId: "U002", timestamp: "2025-02-19 11:15:00", merchantName: "Apple Store", amount: 8000 },
          { transactionId: "T023", userId: "U002", timestamp: "2025-02-19 11:40:00", merchantName: "Walmart", amount: 180 },
          { transactionId: "T035", userId: "U002", timestamp: "2025-02-19 12:40:00", merchantName: "Amazon", amount: 1300 },
          { transactionId: "T030", userId: "U002", timestamp: "2025-02-19 12:15:00", merchantName: "Target", amount: 250 },
          { transactionId: "T032", userId: "U002", timestamp: "2025-02-19 12:25:00", merchantName: "Walmart", amount: 800 }
        ]],
        ["U003", [
          { transactionId: "T003", userId: "U003", timestamp: "2025-02-19 10:10:00", merchantName: "Target", amount: 300 },
          { transactionId: "T008", userId: "U003", timestamp: "2025-02-19 10:40:00", merchantName: "Target", amount: 350 },
          { transactionId: "T009", userId: "U003", timestamp: "2025-02-19 10:50:00", merchantName: "BestBuy", amount: 1800 },
          { transactionId: "T011", userId: "U003", timestamp: "2025-02-19 11:00:00", merchantName: "Apple Store", amount: 5000 },
          { transactionId: "T016", userId: "U003", timestamp: "2025-02-19 11:25:00", merchantName: "Walmart", amount: 950 },
          { transactionId: "T018", userId: "U003", timestamp: "2025-02-19 11:35:00", merchantName: "Amazon", amount: 500 },
          { transactionId: "T019", userId: "U003", timestamp: "2025-02-19 11:36:00", merchantName: "Amazon", amount: 20000 },
          { transactionId: "T020", userId: "U003", timestamp: "2025-02-19 11:37:00", merchantName: "Amazon", amount: 500 },
          { transactionId: "T021", userId: "U003", timestamp: "2025-02-19 11:38:00", merchantName: "Amazon", amount: 500 },
          { transactionId: "T022", userId: "U003", timestamp: "2025-02-19 11:39:00", merchantName: "Amazon", amount: 500 },
          { transactionId: "T037", userId: "U003", timestamp: "2025-02-19 12:50:00", merchantName: "Walmart", amount: 180 },
          { transactionId: "T034", userId: "U003", timestamp: "2025-02-19 12:35:00", merchantName: "Amazon", amount: 950 },
          { transactionId: "T038", userId: "U003", timestamp: "2025-03-19 12:50:00", merchantName: "scam merchant", amount: 2000 }
        ]],
        ["U004", [
          { transactionId: "T006", userId: "U004", timestamp: "2025-02-19 10:30:00", merchantName: "Apple Store", amount: 10000 },
          { transactionId: "T013", userId: "U004", timestamp: "2025-02-19 11:10:00", merchantName: "Target", amount: 450 },
          { transactionId: "T026", userId: "U004", timestamp: "2025-02-19 11:55:00", merchantName: "Amazon", amount: 3000 },
          { transactionId: "T036", userId: "U004", timestamp: "2025-02-19 12:45:00", merchantName: "Target", amount: 500 },
          { transactionId: "T031", userId: "U004", timestamp: "2025-02-19 12:20:00", merchantName: "BestBuy", amount: 1300 }
        ]],
        ["U005", [
          { transactionId: "T010", userId: "U005", timestamp: "2025-02-19 10:55:00", merchantName: "Amazon", amount: 250 },
          { transactionId: "T025", userId: "U005", timestamp: "2025-02-19 11:50:00", merchantName: "Apple Store", amount: 2000 },
          { transactionId: "T033", userId: "U005", timestamp: "2025-02-19 12:30:00", merchantName: "Apple Store", amount: 1500 }
        ]],
        ["U006", [
          { transactionId: "T017", userId: "U006", timestamp: "2025-02-19 11:30:00", merchantName: "Target", amount: 450 },
          { transactionId: "T028", userId: "U006", timestamp: "2025-02-19 12:05:00", merchantName: "BestBuy", amount: 2000 }
        ]]
      ]);
      
      return userTransactions
}
function getMockUserTransactions2(): Map<string, Transaction[]> {
  const userTransactions = new Map<string, any[]>([
      ["U002", [
        { transactionId: "T001", userId: "U002", timestamp: "2025-02-19 10:00:00", merchantName: "Starbucks", amount: 500 },
        { transactionId: "T002", userId: "U002", timestamp: "2025-02-19 10:15:00", merchantName: "BestBuy", amount: 15000 },
      ]],
    ]);
    
    return userTransactions
}

function getMockUserDetails(): Map<string, User> {
       const mockData = new Map<string, User>();
      const users: User[] = [
        { userId: 'U001', location: 1, averageTransactionAmount: 1000 },
        { userId: 'U002', location: 2, averageTransactionAmount: 1000 },
        { userId: 'U003', location: 3, averageTransactionAmount: 1000 },
        { userId: 'U004', location: 4, averageTransactionAmount: 1000 },
        { userId: 'U005', location: 5, averageTransactionAmount: 1000 },
        { userId: 'U006', location: 4, averageTransactionAmount: 250 },
      ];

      // Populating the Map with the mock data
      users.forEach(user => {
        mockData.set(user.userId, user);
      });

      return mockData;
  }

function getMockMerchantData(): Map<string, number[]> {
  const merchantData: Map<string, number[]> = new Map([
    ['Amazon', [1, 2, 3, 4, 5]],
    ['Apple Store', [1, 2, 3, 4, 5]],
    ['BestBuy', [1, 2, 3, 4, 5]],
    ['Target', [1, 2, 3, 4, 5]],
    ['Walmart', [1, 2, 3, 4, 5]],
    ['Starbucks', [1]],
  ]);
  return merchantData
}
