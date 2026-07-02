// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/productClient.js
import { ENDPOINTS } from "../constants/endpoints";
import { createHttpClient } from "./httpClient";

const productClient = createHttpClient(ENDPOINTS.PRODUCT);

export default productClient;
