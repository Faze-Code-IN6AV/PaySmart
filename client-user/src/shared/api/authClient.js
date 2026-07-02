// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/authClient.js
import { ENDPOINTS } from "../constants/endpoints";
import { createHttpClient } from "./httpClient";

const authClient = createHttpClient(ENDPOINTS.AUTH);

export default authClient;
