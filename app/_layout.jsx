import { View, Text, Pressable, StyleSheet } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();

  // Não mostrar navbar na tela de login
  if (pathname === "/") {
    return <Slot />;
  }

  const navItems = [
    { label: "Dash", icon: "speedometer-outline", route: "/dashboard" },
    { label: "Estoque", icon: "cube-outline", route: "/estoque" },
    { label: "Câmera", icon: "camera-outline", route: "/camera" },
    { label: "Chat IA", icon: "chatbubbles-outline", route: "/chat" },
    { label: "Ajuda", icon: "help-circle-outline", route: "/ajuda" },
    { label: "Perfil", icon: "person-outline", route: "/perfil" },
  ];

  return (
    <View style={styles.container}>
      <Slot />

      <View style={styles.navbar}>
        {navItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route)}
            style={styles.navItem}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={pathname.includes(item.route) ? "#1E22AA" : "#666"}
            />
            <Text
              style={[
                styles.navLabel,
                pathname.includes(item.route) && { color: "#1E22AA", fontWeight: "bold" },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});