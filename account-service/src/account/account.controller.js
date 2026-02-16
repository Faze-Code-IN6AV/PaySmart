import { createAccountRecord } from "./account.service.js";

export const createAccount = async (req, res) => {
    try{
        const account = await createAccountRecord({
            accountData: req.body,
            account: req.account
        });

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente!',
            data: account
        });
    }catch(err){
        res.status(400).json({
            success: false,
            message: 'Error al crear la cuenta.',
            error: err.message
        });
    }
}