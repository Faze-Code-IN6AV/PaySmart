// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/accountClient.js
import { ENDPOINTS } from "../constants/endpoints";
import { createHttpClient } from "./httpClient";

const accountClient = createHttpClient(ENDPOINTS.ACCOUNT);

export default accountClient;
