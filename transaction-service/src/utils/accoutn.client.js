import axios from 'axios';

const ACCOUNT_SERVICE_URL = 'http://localhost:3021/paySmart/v1/account';

export const getAccountById = async (accountId) => {
    const response = await axios.get(
        `${ACCOUNT_SERVICE_URL}/account/${accountId}`
    );
    return response.data;
};

export const updateAccountBalance = async (accountId, newBalance) => {
    const response = await axios.put(
        `${ACCOUNT_SERVICE_URL}/account/${accountId}/balance`,
        { balance: newBalance }
    );
    return response.data;
};