// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/favoriteClient.js
import { ENDPOINTS } from "../constants/endpoints";
import { createHttpClient } from "./httpClient";

const favoriteClient = createHttpClient(ENDPOINTS.FAVORITE);

export default favoriteClient;
