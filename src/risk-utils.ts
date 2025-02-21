import fs from 'fs';
import csv from 'csv-parser';
import { Transaction, User } from './common'




export async function loadTransactions(filePath: string): Promise<{ transactions: Transaction[], userTransactions: Map<string, Transaction[]>}>  {
    const transactions: Transaction[] = [];
    const userTransactions:  Map<string, Transaction[]> = new Map<string, Transaction[]>()
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: any) => {
                const transaction: Transaction = {
                    transactionId: data['Transaction ID'],
                    userId: data['user ID'],
                    timestamp: data['timestamp'],
                    merchantName: data['merchant name'],
                    amount: parseFloat(data['amount']),
                }
                transactions.push(transaction);
                if (!userTransactions.has(transaction.userId)) {
                    userTransactions.set(transaction.userId, []);
                }
                userTransactions.get(transaction.userId)!.push(transaction);
            })
            .on('end', () => resolve({transactions, userTransactions}))
            .on('error', (err: any) => reject(err));
    });
}

export async function loadknownMerchants(filePath: string): Promise<Map<string, Number[]>> {
    const knownMerchants: Map<string, Number[]> = new Map<string, Number[]>()
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data: any) => {
            const merchantName = data['merchant name']
            const location = data['location']
            const locationArray = location.split(',').map(Number)
            knownMerchants.set(merchantName, locationArray)
        })
        .on('end', () => resolve(knownMerchants))
        .on('error', (err: any) => reject(err));
    });
}

export async function loadUserDetails(filePath: string): Promise<Map<string, User>> {
    const userDetails: Map<string, User> = new  Map<string, User>()
    return new Promise((resolve, reject) => {
       
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: any) => {
                const userId = data['user ID']
                const location = data['location']
                const averageTransactionAmount = data['average']
                userDetails.set(userId, { userId, location, averageTransactionAmount });
            })
            .on('end', () => resolve(userDetails))
            .on('error', (err: any) => reject(err));
    });
}
// Rule 1: High Frequency Transactions (same user ID within 5 transactions in 5 minutes)
export function ruleHighFrequency(userTransactions: Map<string, Transaction[]>): Set<string> {
    const suspicious: Set<string> = new Set<string>();

    userTransactions.forEach((userTrans) => {
        userTrans.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        for (let i = 0; i < userTrans.length - 4; i++) {
            const timeDiff = (new Date(userTrans[i + 4].timestamp).getTime() - new Date(userTrans[i].timestamp).getTime()) / 1000;
            if (timeDiff <= 300) { // 5 transactions within 5 minutes
                for (let j = i; j < i + 5; j++) {
                    suspicious.add(userTrans[j].transactionId);
                }
            }
        }
    });

    return suspicious;
}

// Rule 2: Large Amount Transactions
export function ruleLargeAmount(transactions: Transaction[],threshold: number = 10000): Set<string> {
    let suspicious: Set<string> = new Set<string>()
    transactions.forEach((transaction) => {
        if(transaction.amount > threshold) {
            suspicious.add(transaction.transactionId)
        }
    })
    return suspicious
}

// Rule 3: Unusual Merchant Activity (unknown merchant with large transaction)
export function ruleUnknownMerchant(transactions: Transaction[], knownMerchants: Map<string, Number[]>, threshold: number = 1000): Set<string> {
    let suspiciousIdx: Set<string> = new Set<string>()
     transactions.forEach((transaction, _) => {
        if(!knownMerchants.has(transaction.merchantName)) {
             suspiciousIdx.add(transaction.transactionId)
        }
    })
    return suspiciousIdx
}
 // Rule 3:  geographical anomaly check 
export function ruleGeographicalAnomalies(userTransactions: Map<string, Transaction[]>, userDetails: Map<string, User>, merchantDetails: Map<string, Number[]>): Set<string> {
   
    let suspiciousIdx: Set<string> = new Set<string>()
    userTransactions.forEach((transactions, user) => {
        const userLocation: Number|undefined =  userDetails.get(user)?.location
        if(!userLocation) {
            return
        }
        
        transactions.forEach((transaction, _) => {
            const merchant = transaction.merchantName
            const merchantLocations: Number[]|undefined = merchantDetails.get(merchant)
            if(!merchantLocations?.includes(Number(userLocation))) {
                suspiciousIdx.add(transaction.transactionId)
            }
        })
    });
    return suspiciousIdx
}

// Rule 5: Inconsistent Spending Patterns (more than 3x the average transaction amount)
export function ruleInconsistentSpending(userTransactions: Map<string, Transaction[]>, userDetails: Map<string, User>): Set<string> {
    let suspiciousIdx: Set<string> = new Set<string>()
    userTransactions.forEach((transactions, userId) => {
        const averageTransactionAmount: number | undefined = userDetails.get(userId)?.averageTransactionAmount
        if(averageTransactionAmount !== undefined && averageTransactionAmount > 0) {
            const threshold = 3*averageTransactionAmount
            transactions.forEach((transaction, idx) => {
                if (transaction.amount > threshold) {
                    suspiciousIdx.add(transaction.transactionId)
                }
            });
        } 
    });
    return suspiciousIdx;
}

