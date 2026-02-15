import Account from './account.model.js'

export const createAccountRecord = async ({accountData}) => {
    const data = {...accountData};

    const account = new Account(data);
    await account.save();
    
    return account;
}