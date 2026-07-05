// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/CurrencyConverter.jsx
import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

const API_URL = "https://open.er-api.com/v6/latest/GTQ";

const CURRENCIES = [
  { code: "GTQ", flag: "🇬🇹", name: "Quetzal guatemalteco" },
  { code: "USD", flag: "🇺🇸", name: "Dólar estadounidense" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "MXN", flag: "🇲🇽", name: "Peso mexicano" },
  { code: "HNL", flag: "🇭🇳", name: "Lempira hondureño" },
  { code: "CRC", flag: "🇨🇷", name: "Colón costarricense" },
  { code: "GBP", flag: "🇬🇧", name: "Libra esterlina" },
  { code: "JPY", flag: "🇯🇵", name: "Yen japonés" },
  { code: "CAD", flag: "🇨🇦", name: "Dólar canadiense" },
  { code: "BRL", flag: "🇧🇷", name: "Real brasileño" },
];

const QUICK_RATES = ["USD", "EUR", "MXN", "GBP", "BRL", "CAD", "JPY", "HNL", "CRC"];

const fmt = (n, decimals = 2) =>
  Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: decimals });

function CurrencyPickerModal({ visible, onClose, onSelect, selected }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c.code}
              style={[styles.modalRow, c.code === selected ? styles.modalRowActive : null]}
              onPress={() => {
                onSelect(c.code);
                onClose();
              }}
            >
              <Text style={styles.modalFlag}>{c.flag}</Text>
              <Text style={styles.modalText}>
                {c.code} — {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export function CurrencyConverter() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("GTQ");
  const [to, setTo] = useState("USD");
  const [pickerOpen, setPickerOpen] = useState(null); // "from" | "to" | null
  const [updatedAt, setUpdatedAt] = useState("");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!data?.rates) throw new Error("No se pudo obtener las tasas");
      setRates(data.rates);
      setUpdatedAt(
        data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })
          : new Date().toLocaleDateString("es-GT")
      );
    } catch {
      setError("No se pudo cargar el conversor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  let result = null;
  if (rates && amount && !isNaN(Number(amount))) {
    const inGTQ = Number(amount) / (from === "GTQ" ? 1 : rates[from]);
    result = inGTQ * (to === "GTQ" ? 1 : rates[to]);
  }

  const fromCur = CURRENCIES.find((c) => c.code === from);
  const toCur = CURRENCIES.find((c) => c.code === to);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="public" size={16} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Conversor de Divisas</Text>
        <Pressable onPress={fetchRates} disabled={loading} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>{loading ? "…" : "Actualizar"}</Text>
        </Pressable>
      </View>

      {updatedAt ? <Text style={styles.updatedAt}>Actualizado: {updatedAt}</Text> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {rates && (
        <>
          <Text style={styles.label}>Monto a convertir</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.selectorRow}>
            <Pressable style={styles.selector} onPress={() => setPickerOpen("from")}>
              <Text style={styles.selectorLabel}>De</Text>
              <Text style={styles.selectorValue}>
                {fromCur?.flag} {from}
              </Text>
            </Pressable>

            <Pressable style={styles.swapButton} onPress={swap}>
              <MaterialIcons name="swap-horiz" size={20} color={COLORS.primary} />
            </Pressable>

            <Pressable style={styles.selector} onPress={() => setPickerOpen("to")}>
              <Text style={styles.selectorLabel}>A</Text>
              <Text style={styles.selectorValue}>
                {toCur?.flag} {to}
              </Text>
            </Pressable>
          </View>

          {result !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>
                {fromCur?.flag} {fmt(amount)} {from}
              </Text>
              <MaterialIcons name="arrow-downward" size={16} color={COLORS.primary} style={{ marginVertical: 4 }} />
              <Text style={styles.resultValue}>
                {toCur?.flag} {fmt(result)}
              </Text>
              <Text style={styles.resultCode}>{to}</Text>
            </View>
          )}

          <Text style={styles.quickTitle}>TASAS VS. QUETZAL (GTQ)</Text>
          <View style={styles.quickGrid}>
            {QUICK_RATES.map((code) => {
              const cur = CURRENCIES.find((c) => c.code === code);
              const active = code === to;
              return (
                <Pressable
                  key={code}
                  onPress={() => setTo(code)}
                  style={[styles.quickItem, active ? styles.quickItemActive : null]}
                >
                  <Text style={styles.quickFlag}>{cur?.flag}</Text>
                  <Text style={[styles.quickCode, active ? { color: COLORS.primary } : null]}>{code}</Text>
                  <Text style={[styles.quickValue, active ? { color: COLORS.secondary } : null]}>
                    {fmt(rates[code])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <CurrencyPickerModal
        visible={pickerOpen === "from"}
        onClose={() => setPickerOpen(null)}
        onSelect={setFrom}
        selected={from}
      />
      <CurrencyPickerModal
        visible={pickerOpen === "to"}
        onClose={() => setPickerOpen(null)}
        onSelect={setTo}
        selected={to}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.15)",
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  refreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(65,210,242,0.1)",
  },
  refreshText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  updatedAt: {
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: SPACING.xs,
  },
  amountInput: {
    backgroundColor: COLORS.secondaryBlue,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  selector: {
    flex: 1,
    backgroundColor: COLORS.secondaryBlue,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.3)",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  selectorLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
  },
  selectorValue: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  swapButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(65,210,242,0.1)",
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.2)",
  },
  resultBox: {
    alignItems: "center",
    backgroundColor: "rgba(65,210,242,0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.2)",
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  resultLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FONT_SIZE.sm,
  },
  resultValue: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
  },
  resultCode: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  quickTitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  quickItem: {
    width: "31%",
    backgroundColor: "rgba(11,24,48,0.5)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.07)",
    padding: SPACING.sm,
  },
  quickItemActive: {
    backgroundColor: "rgba(65,210,242,0.12)",
    borderColor: "rgba(65,210,242,0.35)",
  },
  quickFlag: {
    fontSize: 16,
    marginBottom: 2,
  },
  quickCode: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  quickValue: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,24,48,0.8)",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.25)",
    paddingVertical: SPACING.sm,
    maxHeight: "70%",
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  modalRowActive: {
    backgroundColor: "rgba(65,210,242,0.1)",
  },
  modalFlag: {
    fontSize: 18,
  },
  modalText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
});