import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  const titulo = "I9 Assist";
  const subTitulo = "Assistente inteligente da I9Tech";
  const notificacoes = 3;

  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dash", icon: "speedometer-outline", route: "/dashboard" },
    { label: "Estoque", icon: "cube-outline", route: "/estoque" },
    { label: "Câmera", icon: "camera-outline", route: "/camera" },
    { label: "Chat IA", icon: "chatbubbles-outline", route: "/chat" },
    { label: "Ajuda", icon: "help-circle-outline", route: "/ajuda" },
    { label: "Perfil", icon: "person-outline", route: "/perfil" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === "ios" ? ["left", "right"] : ["top"] }>
      
      {/* HEADER */}
      <View style={styles.header}>

        <View>
          <Text style={styles.headerText}>{titulo}</Text>
          <Text style={styles.subText}>{subTitulo}</Text>
        </View>

        {/* BOTÃO NOTIFICAÇÃO */}
        <Pressable
          style={styles.notificationButton}
          onPress={() => router.push("/notificacoes")}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />

          {notificacoes > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificacoes}</Text>
            </View>
          )}
        </Pressable>

      </View>

      {/* ÁREA DAS TELAS */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        {navItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.replace(item.route)}
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
                pathname.includes(item.route) && {
                  color: "#1E22AA",
                  fontWeight: "bold",
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 25,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    fontSize: 15,
    fontWeight: "600",
  },

  subText: {
    fontSize: 12,
    fontWeight: "400",
  },

  notificationButton: {
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  content: {
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