// /Users/diego/Tareas/Taller/PaySmart/client-user/src/navigation/AppNavigator.jsx
import { NavigationContainer } from "@react-navigation/native";

import { LoadingSpinner } from "../shared/components/common/Common";
import { useAuthStore } from "../shared/store/authStore";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";

export function AppNavigator() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return <LoadingSpinner label="Cargando sesión..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
