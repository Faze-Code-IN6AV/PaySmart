// /Users/diego/Tareas/Taller/PaySmart/client-user/src/navigation/MainTabs.jsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "../shared/constants/theme";

const Tab = createBottomTabNavigator();
const AccountsStackNav = createNativeStackNavigator();
const TransactionsStackNav = createNativeStackNavigator();
const ProductsStackNav = createNativeStackNavigator();
const FavoritesStackNav = createNativeStackNavigator();

function PlaceholderScreen({ title }) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>{title}</Text>
    </View>
  );
}

function AccountsStack() {
  return (
    <AccountsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AccountsStackNav.Screen name="AccountsList" component={() => <PlaceholderScreen title="Cuentas" />} />
      <AccountsStackNav.Screen name="CreateAccount" component={() => <PlaceholderScreen title="Crear cuenta" />} />
      <AccountsStackNav.Screen name="AccountDetail" component={() => <PlaceholderScreen title="Detalle de cuenta" />} />
    </AccountsStackNav.Navigator>
  );
}

function TransactionsStack() {
  return (
    <TransactionsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <TransactionsStackNav.Screen name="TransactionsList" component={() => <PlaceholderScreen title="Transacciones" />} />
      <TransactionsStackNav.Screen name="Deposit" component={() => <PlaceholderScreen title="Depósito" />} />
      <TransactionsStackNav.Screen name="Transfer" component={() => <PlaceholderScreen title="Transferencia" />} />
      <TransactionsStackNav.Screen name="TransactionHistory" component={() => <PlaceholderScreen title="Historial" />} />
    </TransactionsStackNav.Navigator>
  );
}

function ProductsStack() {
  return (
    <ProductsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStackNav.Screen name="ProductsList" component={() => <PlaceholderScreen title="Productos" />} />
      <ProductsStackNav.Screen name="ProductDetail" component={() => <PlaceholderScreen title="Detalle de producto" />} />
      <ProductsStackNav.Screen name="MyPurchases" component={() => <PlaceholderScreen title="Mis compras" />} />
    </ProductsStackNav.Navigator>
  );
}

function FavoritesStack() {
  return (
    <FavoritesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStackNav.Screen name="FavoritesList" component={() => <PlaceholderScreen title="Favoritos" />} />
      <FavoritesStackNav.Screen name="AddFavorite" component={() => <PlaceholderScreen title="Agregar favorito" />} />
    </FavoritesStackNav.Navigator>
  );
}

function ProfileScreen() {
  return <PlaceholderScreen title="Perfil" />;
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = {
            Accounts: "account-balance-wallet",
            Transactions: "swap-horiz",
            Products: "shopping-bag",
            Favorites: "star",
            Profile: "person",
          }[route.name];

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accounts" component={AccountsStack} options={{ title: "Cuentas" }} />
      <Tab.Screen name="Transactions" component={TransactionsStack} options={{ title: "Movs." }} />
      <Tab.Screen name="Products" component={ProductsStack} options={{ title: "Productos" }} />
      <Tab.Screen name="Favorites" component={FavoritesStack} options={{ title: "Favoritos" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil", headerShown: true }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  placeholderTitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "center",
  },
});
