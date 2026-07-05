// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/MaskedAccountNumber.jsx
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { maskAccountNumber } from "../../utils/format";

// Réplica del comportamiento de AccountCard.jsx / FavoriteAccountCard.jsx en
// client-admin: por defecto se muestran ocultos todos los dígitos salvo los
// últimos 4, con un botón de ojo para revelar el número completo.
export function MaskedAccountNumber({ accountNumber, accentColor, textStyle }) {
  const [visible, setVisible] = useState(false);
  const full = String(accountNumber || "").replace(/(.{4})/g, "$1 ").trim() || "—";

  return (
    <View style={styles.row}>
      <Text style={[styles.number, textStyle]} numberOfLines={1}>
        {visible ? full : maskAccountNumber(accountNumber)}
      </Text>
      <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} style={styles.eyeButton}>
        <MaterialIcons
          name={visible ? "visibility-off" : "visibility"}
          size={16}
          color={accentColor || "#41D2F2"}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  number: {
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  eyeButton: {
    padding: 2,
  },
});