// /Users/diego/Tareas/Taller/PaySmart/client-user/src/navigation/AppNavigator.jsx
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

import { LoadingSpinner } from "../shared/components/common/Common";
import { COLORS, FONT_SIZE, SPACING } from "../shared/constants/theme";
import { useAuthStore } from "../shared/store/authStore";
import { AuthStack } from "./AuthStack";

export function AppNavigator() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return <LoadingSpinner label="Cargando sesión..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <View style={styles.authenticatedContainer}>
          <Text style={styles.title}>App autenticada</Text>
          <Text style={styles.subtitle}>La navegación principal se implementará en la siguiente fase.</Text>
        </View>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  authenticatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
