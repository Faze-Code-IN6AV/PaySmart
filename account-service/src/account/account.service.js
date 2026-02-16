import Account from './account.model.js'

export const createAccountRecord = async ({accountData}) => {
    const data = {...accountData};

    const account = new Account(data);
    await account.save();
    
    return account;
}

export const getAccountsByUser = async (userId) => {
    return await Account.find({ userId });
};

export const getAccountBalance = async (accountNumber, userId) => {
    // Buscar cuenta por número y que pertenezca al usuario
    const account = await Account.findOne({ accountNumber, userId });

    if (!account) return null;

    return {
        accountNumber: account.accountNumber,
        balance: account.balance
    };
};