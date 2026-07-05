// /Users/diego/Tareas/Taller/PaySmart/client-user/App.jsx
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { COLORS } from "./src/shared/constants/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["left", "right", "bottom"]}>
        <AppNavigator />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}