import Account from './account.model.js'

export const createAccountRecord = async ({ accountData }) => {
    const data = { ...accountData };

    // Verificar si el usuario ya tiene una cuenta de ese tipo
    const existing = await Account.findOne({ 
        userId: data.userId, 
        accountType: data.accountType 
    });

    if (existing) {
        throw new Error(`Ya tienes una cuenta de tipo ${data.accountType}`);
    }

    const account = new Account(data);
    await account.save();

    return account;
};

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