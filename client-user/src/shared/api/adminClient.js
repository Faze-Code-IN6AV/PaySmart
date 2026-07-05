// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/adminClient.js
import { ENDPOINTS } from "../constants/endpoints";
import { createHttpClient } from "./httpClient";

// Mismo microservicio que authClient, pero apuntando a la raíz (sin "/auth")
// para poder llamar a las rutas /users/* que usa el administrador
// (equivalente a axiosAdmin en client-admin).
const adminClient = createHttpClient(ENDPOINTS.AUTH_ROOT);

export default adminClient;