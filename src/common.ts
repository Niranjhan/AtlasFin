export interface Transaction {
    transactionId: string;
    userId: string;
    timestamp: string;
    merchantName: string;
    amount: number;
}

export interface User {
    userId: string;
    location: Number;
    averageTransactionAmount: number;
}