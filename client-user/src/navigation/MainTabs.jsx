// /Users/diego/Tareas/Taller/PaySmart/client-user/src/navigation/MainTabs.jsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import { AccountsScreen } from "../features/accounts/screens/AccountsScreen";
import { AccountDetailScreen } from "../features/accounts/screens/AccountDetailScreen";
import { CreateAccountScreen } from "../features/accounts/screens/CreateAccountScreen";
import { DepositScreen } from "../features/transactions/screens/DepositScreen";
import { TransactionHistoryScreen } from "../features/transactions/screens/TransactionHistoryScreen";
import { TransactionsScreen } from "../features/transactions/screens/TransactionsScreen";
import { TransferScreen } from "../features/transactions/screens/TransferScreen";
import { MyPurchasesScreen } from "../features/products/screens/MyPurchasesScreen";
import { ProductDetailScreen } from "../features/products/screens/ProductDetailScreen";
import { ProductsScreen } from "../features/products/screens/ProductsScreen";
import { AddFavoriteScreen } from "../features/favorites/screens/AddFavoriteScreen";
import { FavoritesScreen } from "../features/favorites/screens/FavoritesScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { COLORS } from "../shared/constants/theme";

const Tab = createBottomTabNavigator();
const AccountsStackNav = createNativeStackNavigator();
const TransactionsStackNav = createNativeStackNavigator();
const ProductsStackNav = createNativeStackNavigator();
const FavoritesStackNav = createNativeStackNavigator();

function AccountsStack() {
  return (
    <AccountsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AccountsStackNav.Screen name="AccountsList" component={AccountsScreen} />
      <AccountsStackNav.Screen name="CreateAccount" component={CreateAccountScreen} />
      <AccountsStackNav.Screen name="AccountDetail" component={AccountDetailScreen} />
    </AccountsStackNav.Navigator>
  );
}

function TransactionsStack() {
  return (
    <TransactionsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <TransactionsStackNav.Screen name="TransactionsList" component={TransactionsScreen} />
      <TransactionsStackNav.Screen name="Deposit" component={DepositScreen} />
      <TransactionsStackNav.Screen name="Transfer" component={TransferScreen} />
      <TransactionsStackNav.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </TransactionsStackNav.Navigator>
  );
}

function ProductsStack() {
  return (
    <ProductsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStackNav.Screen name="ProductsList" component={ProductsScreen} />
      <ProductsStackNav.Screen name="ProductDetail" component={ProductDetailScreen} />
      <ProductsStackNav.Screen name="MyPurchases" component={MyPurchasesScreen} />
    </ProductsStackNav.Navigator>
  );
}

function FavoritesStack() {
  return (
    <FavoritesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStackNav.Screen name="FavoritesList" component={FavoritesScreen} />
      <FavoritesStackNav.Screen name="AddFavorite" component={AddFavoriteScreen} />
    </FavoritesStackNav.Navigator>
  );
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

