// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/transactionClient.js
import { ENDPOINTS } from "../constants/endpoints";
import { createHttpClient } from "./httpClient";

const transactionClient = createHttpClient(ENDPOINTS.TRANSACTION);

export default transactionClient;
