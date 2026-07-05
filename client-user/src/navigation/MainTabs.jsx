// /Users/diego/Tareas/Taller/PaySmart/client-user/src/navigation/MainTabs.jsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { HomeScreen } from "../features/home/screens/HomeScreen";
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
import { ClientsScreen } from "../features/clients/screens/ClientsScreen";
import { ClientFormScreen } from "../features/clients/screens/ClientFormScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { useAuthStore } from "../shared/store/authStore";
import { COLORS } from "../shared/constants/theme";

const Tab = createBottomTabNavigator();
const AccountsStackNav = createNativeStackNavigator();
const TransactionsStackNav = createNativeStackNavigator();
const ProductsStackNav = createNativeStackNavigator();
const FavoritesStackNav = createNativeStackNavigator();
const ClientsStackNav = createNativeStackNavigator();

// Fondo decorativo de la barra superior — anillos sutiles en celeste.
function HeaderBackground() {
  return (
    <View style={styles.headerBg}>
      <View style={styles.headerRingRight} />
      <View style={styles.headerRingRight2} />
      <View style={styles.headerGlowLeft} />
    </View>
  );
}

// Izquierda: back button manual (para no perder la flecha nativa al
// reemplazar headerLeft) + nombre de la sección, en letra más grande.
// `padded`: la barra nativa de las pilas (Cuentas, Movimientos, etc.) ya
// reserva su propio margen izquierdo; la barra de las pestañas (Inicio,
// Perfil) no, así que solo ahí agregamos padding extra.
function HeaderLeftContent({ canGoBack, title, padded }) {
  const navigation = useNavigation();

  return (
    <View style={[styles.headerLeftRow, padded ? { paddingLeft: 16 } : null]}>
      {canGoBack ? (
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={18} color={COLORS.primary} />
        </Pressable>
      ) : null}
      <Text style={styles.headerTitleText} numberOfLines={1}>{title}</Text>
    </View>
  );
}

// Derecha: tipo de cuenta (Usuario/Administrador) + nombre y apellido reales
// del usuario (no el username).
function HeaderRightContent({ padded }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN_ROLE";
  const fullName = [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

  return (
    <View style={[styles.headerRightBox, padded ? { paddingRight: 16 } : null]}>
      <Text style={styles.headerRoleText} numberOfLines={1}>{isAdmin ? "Administrador" : "Usuario"}</Text>
      <Text style={styles.headerNameText} numberOfLines={1}>{fullName}</Text>
    </View>
  );
}

// Logo de PaySmart, centrado dentro de la barra (sin salirse de sus
// límites): la barra nativa de las pilas internas (Cuentas, Movimientos,
// etc.) recorta cualquier contenido que se salga de su alto, y la barra de
// las pestañas (Inicio, Perfil) no recorta nada, así que un mismo "sobresale"
// se veía invisible en una y desbordado en la otra. Contenerlo del todo es lo
// único que se ve igual y correcto en ambas.
function HeaderLogoBox() {
  return (
    <View style={styles.logoBox}>
      <Image
        source={require("../../assets/paysmart_icon_outline_transparent.png")}
        style={styles.logoBoxImage}
        resizeMode="contain"
      />
    </View>
  );
}

// Estilo de barra superior compartido — para las pilas internas (Cuentas,
// Movimientos, Productos, Favoritos), cuya barra nativa ya trae su propio
// margen lateral.
const HEADER_SCREEN_OPTIONS = {
  headerShown: true,
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  headerBackground: () => <HeaderBackground />,
  headerTitleAlign: "center",
  headerTitle: () => <HeaderLogoBox />,
  headerRight: () => <HeaderRightContent padded={false} />,
};

// Variante para las pantallas que cuelgan directamente del Tab.Navigator
// (Inicio, Mi Perfil): esa barra no reserva margen propio, así que aquí sí
// agregamos el padding extra.
const TAB_HEADER_SCREEN_OPTIONS = {
  ...HEADER_SCREEN_OPTIONS,
  headerRight: () => <HeaderRightContent padded />,
};

// Título para pantallas raíz de cada pestaña (Cuentas, Movimientos,
// Productos, Favoritos): incluye el logo centrado.
function rootScreenTitle(title) {
  return {
    title,
    headerLeft: ({ canGoBack }) => <HeaderLeftContent canGoBack={canGoBack} title={title} padded={false} />,
    headerTitle: () => <HeaderLogoBox />,
  };
}

// Título para Inicio / Mi Perfil (cuelgan directo del Tab.Navigator).
function tabScreenTitle(title) {
  return {
    title,
    headerLeft: ({ canGoBack }) => <HeaderLeftContent canGoBack={canGoBack} title={title} padded />,
    headerTitle: () => <HeaderLogoBox />,
  };
}

// Título para subpantallas (detalle, crear, depósito, transferencia, etc.):
// sin logo, para no desalinear el título junto al botón de regresar.
// `unmountOnBlur`: si el usuario cambia de pestaña estando en una de estas
// subpantallas (p. ej. Transferencia) y luego vuelve, la pantalla se
// descarta y la pila regresa sola a su lista principal, en vez de quedarse
// "atascada" mostrando el formulario.
function subScreenTitle(title) {
  return {
    title,
    headerLeft: ({ canGoBack }) => <HeaderLeftContent canGoBack={canGoBack} title={title} padded={false} />,
    headerTitle: () => null,
    unmountOnBlur: true,
  };
}

function AccountsStack() {
  return (
    <AccountsStackNav.Navigator screenOptions={HEADER_SCREEN_OPTIONS}>
      <AccountsStackNav.Screen name="AccountsList" component={AccountsScreen} options={rootScreenTitle("Cuentas")} />
      <AccountsStackNav.Screen name="CreateAccount" component={CreateAccountScreen} options={subScreenTitle("Crear cuenta")} />
      <AccountsStackNav.Screen name="AccountDetail" component={AccountDetailScreen} options={subScreenTitle("Detalle de cuenta")} />
    </AccountsStackNav.Navigator>
  );
}

function TransactionsStack() {
  return (
    <TransactionsStackNav.Navigator screenOptions={HEADER_SCREEN_OPTIONS}>
      <TransactionsStackNav.Screen name="TransactionsList" component={TransactionsScreen} options={rootScreenTitle("Movimientos")} />
      <TransactionsStackNav.Screen name="Deposit" component={DepositScreen} options={subScreenTitle("Depósito")} />
      <TransactionsStackNav.Screen name="Transfer" component={TransferScreen} options={subScreenTitle("Transferencia")} />
      <TransactionsStackNav.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={subScreenTitle("Historial")} />
    </TransactionsStackNav.Navigator>
  );
}

function ProductsStack() {
  return (
    <ProductsStackNav.Navigator screenOptions={HEADER_SCREEN_OPTIONS}>
      <ProductsStackNav.Screen name="ProductsList" component={ProductsScreen} options={rootScreenTitle("Productos")} />
      <ProductsStackNav.Screen name="ProductDetail" component={ProductDetailScreen} options={subScreenTitle("Detalle de producto")} />
      <ProductsStackNav.Screen name="MyPurchases" component={MyPurchasesScreen} options={subScreenTitle("Mis compras")} />
    </ProductsStackNav.Navigator>
  );
}

function FavoritesStack() {
  return (
    <FavoritesStackNav.Navigator screenOptions={HEADER_SCREEN_OPTIONS}>
      <FavoritesStackNav.Screen name="FavoritesList" component={FavoritesScreen} options={rootScreenTitle("Favoritos")} />
      <FavoritesStackNav.Screen name="AddFavorite" component={AddFavoriteScreen} options={subScreenTitle("Agregar favorito")} />
    </FavoritesStackNav.Navigator>
  );
}

// Solo para ADMIN_ROLE — equivalente a AdminClientsPage.jsx (client-admin).
function ClientsStack() {
  return (
    <ClientsStackNav.Navigator screenOptions={HEADER_SCREEN_OPTIONS}>
      <ClientsStackNav.Screen name="ClientsList" component={ClientsScreen} options={rootScreenTitle("Clientes")} />
      <ClientsStackNav.Screen name="ClientForm" component={ClientFormScreen} options={subScreenTitle("Cliente")} />
    </ClientsStackNav.Navigator>
  );
}

// Íconos y orden calcados del sidebar de client-admin (DashboardLayout.jsx → CLIENT_NAV)
const TAB_ICON = {
  Home: "home",
  Clients: "groups",
  Accounts: "credit-card",
  Transactions: "swap-horiz",
  Products: "widgets",
  Favorites: "star",
  Profile: "account-circle",
};

const TAB_LABEL = {
  Home: "Inicio",
  Clients: "Clientes",
  Accounts: "Cuentas",
  Transactions: "Movs.",
  Products: "Productos",
  Favorites: "Favoritas",
  Profile: "Perfil",
};

function TabIcon({ name, color, focused }) {
  return (
    <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
      <MaterialIcons name={TAB_ICON[name]} size={20} color={color} />
    </View>
  );
}

export function MainTabs() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN_ROLE";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => <TabIcon name={route.name} color={color} focused={focused} />,
        tabBarLabel: ({ focused, color }) =>
          focused ? <Text style={[styles.tabLabel, { color }]}>{TAB_LABEL[route.name]}</Text> : null,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: "rgba(65,210,242,0.15)",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        key="Home"
        name="Home"
        component={HomeScreen}
        options={{ ...TAB_HEADER_SCREEN_OPTIONS, ...tabScreenTitle("Inicio") }}
      />

      {isAdmin ? (
        // Barra de administrador — calcada del sidebar de escritorio:
        // Inicio, Clientes, Cuentas, Transacciones, Productos (+ Perfil,
        // para poder cerrar sesión). Sin Favoritos, igual que en escritorio.
        // NOTA: cada Tab.Screen lleva su propia `key` explícita — al
        // renderizar pantallas condicionalmente (admin vs. usuario) dentro
        // de un Tab.Navigator, React necesita esa key para no confundir un
        // conjunto de pantallas con el otro (causaba el warning de "keys"
        // duplicadas al iniciar sesión).
        <>
          <Tab.Screen key="Clients" name="Clients" component={ClientsStack} />
          <Tab.Screen key="Accounts" name="Accounts" component={AccountsStack} />
          <Tab.Screen key="Transactions" name="Transactions" component={TransactionsStack} />
          <Tab.Screen key="Products" name="Products" component={ProductsStack} />
        </>
      ) : (
        <>
          <Tab.Screen key="Accounts" name="Accounts" component={AccountsStack} />
          <Tab.Screen key="Transactions" name="Transactions" component={TransactionsStack} />
          <Tab.Screen key="Products" name="Products" component={ProductsStack} />
          <Tab.Screen key="Favorites" name="Favorites" component={FavoritesStack} />
        </>
      )}

      <Tab.Screen
        key="Profile"
        name="Profile"
        component={ProfileScreen}
        options={{ ...TAB_HEADER_SCREEN_OPTIONS, ...tabScreenTitle("Mi Perfil") }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  iconWrap: {
    width: 34,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(65,210,242,0.12)",
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 20,
  },
  headerRightBox: {
    alignItems: "flex-end",
    maxWidth: 130,
  },
  headerRoleText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  headerNameText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  // Fondo distinto al de la barra (antes se confundía con el mismo azul),
  // para que el logo resalte con contraste. Tamaño ajustado para caber
  // dentro del alto real de la barra (uno más grande se desbordaba y
  // tapaba el contenido de abajo).
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: COLORS.secondaryBlue,
    borderWidth: 2,
    borderColor: "rgba(65,210,242,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBoxImage: {
    width: 32,
    height: 32,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  headerRingRight: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.18)",
  },
  headerRingRight2: {
    position: "absolute",
    top: -12,
    right: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,233,104,0.06)",
  },
  headerGlowLeft: {
    position: "absolute",
    bottom: -40,
    left: -30,
    width: 110,
    height: 60,
    borderRadius: 40,
    backgroundColor: "rgba(65,210,242,0.05)",
  },
});