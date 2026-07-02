// /Users/diego/Tareas/Taller/PaySmart/client-user/eslint.config.js
import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...expoConfig,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
