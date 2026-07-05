// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/ScreenBackground.jsx
import { StyleSheet, View } from "react-native";

import { COLORS } from "../../constants/theme";

// Fondo decorativo reutilizable: anillos y resplandores sutiles en celeste,
// inspirados en la decoración del sidebar de client-admin. Se coloca detrás
// del contenido de cada pantalla (position: absolute, no intercepta toques).
export function ScreenBackground({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      <View pointerEvents="none" style={styles.decorLayer}>
        <View style={[styles.ring, styles.ringTopRight]} />
        <View style={[styles.ring, styles.ringTopRight2]} />
        <View style={styles.glowTopLeft} />
        <View style={styles.glowBottom} />
        <View style={[styles.ring, styles.ringBottomLeft]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.08)",
  },
  ringTopRight: {
    width: 220,
    height: 220,
    top: -70,
    right: -70,
  },
  ringTopRight2: {
    width: 130,
    height: 130,
    top: -25,
    right: -25,
    borderColor: "rgba(65,210,242,0.1)",
  },
  ringBottomLeft: {
    width: 260,
    height: 260,
    bottom: -100,
    left: -110,
    borderColor: "rgba(65,210,242,0.06)",
  },
  glowTopLeft: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    top: 20,
    left: -60,
    backgroundColor: "rgba(65,210,242,0.06)",
  },
  glowBottom: {
    position: "absolute",
    width: 220,
    height: 140,
    borderRadius: 999,
    bottom: -40,
    right: -40,
    backgroundColor: "rgba(255,233,104,0.045)",
  },
});