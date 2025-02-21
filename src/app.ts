import { loadTransactions, loadUserDetails, loadknownMerchants, ruleHighFrequency, ruleLargeAmount, ruleUnknownMerchant, ruleGeographicalAnomalies, ruleInconsistentSpending } from '../src/risk-utils';




// Step 2: Combine the rules and flag suspicious transactions
export async function flagSuspiciousTransactions(transactionsFilePath: string, merchantsFilePath: string, userFilePath: string) {
    const { transactions, userTransactions } = await loadTransactions(transactionsFilePath);
    const knownMerchants = await loadknownMerchants(merchantsFilePath)
    const userDetails = await loadUserDetails(userFilePath)
   
    let suspiciousIndices: Set<string> = new Set();

    // Apply the rules
    suspiciousIndices = new Set([
        ...suspiciousIndices,
        ...ruleHighFrequency(userTransactions),
        ...ruleLargeAmount(transactions),
        ...ruleUnknownMerchant(transactions, knownMerchants),
        ...ruleGeographicalAnomalies(userTransactions, userDetails, knownMerchants),
        ...ruleInconsistentSpending(userTransactions, userDetails),
    ]);

    // Step 3: Flag the suspicious transactions
    const flaggedTransactions = transactions.filter((transaction, _) => suspiciousIndices.has(transaction.transactionId));
    
    // Step 4: Output the flagged transactions to a new CSV file
    const output = flaggedTransactions.map((trans) => ({
        ...trans,
        suspicious: true,
    }));
 
    output.forEach((transaction) => {
        console.log(`${transaction.userId},${transaction.timestamp},${transaction.merchantName},${transaction.amount},${transaction.suspicious}\n`)
    });
}

flagSuspiciousTransactions(`${__dirname}/transactions.csv`, `${__dirname}/known-merchants.csv`,`${__dirname}/user-details.csv`)
