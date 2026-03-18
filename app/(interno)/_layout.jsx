import { View, Text, Pressable, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  // Estados para Título e Subtítulo
  const [titulo, setTitulo] = useState("App");
  const [subTitulo, setSubTitulo] = useState("");

  // Injeção das funções globais
  global.setHeaderTitulo = setTitulo;
  global.setHeaderSubTitulo = setSubTitulo;

  const notificacoes = 3;

  // Lógica para mostrar o botão apenas no estoque
  const isEstoque = pathname.includes("/estoque");

  const navItems = [
    { label: "Dash", icon: "speedometer-outline", route: "/dashboard" },
    { label: "Estoque", icon: "cube-outline", route: "/estoque" },
    { label: "Câmera", icon: "camera-outline", route: "/camera" },
    { label: "Chat IA", icon: "chatbubbles-outline", route: "/chat" },
    { label: "Ajuda", icon: "help-circle-outline", route: "/ajuda" },
    { label: "Perfil", icon: "person-outline", route: "/perfil" },
  ];

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["left", "right"] : ["top"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>{titulo}</Text>
          {subTitulo ? <Text style={styles.subText}>{subTitulo}</Text> : null}
        </View>

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

      {/* CONTEÚDO */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        {navItems.map((item) => {
          const isActive = pathname.includes(item.route);
          return (
            <Pressable
              key={item.label}
              onPress={() => router.replace(item.route)}
              style={styles.navItem}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={isActive ? "#1E22AA" : "#666"}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* BOTÃO ADICIONAR (+) - FIXO NA FRENTE DA NAVBAR */}
      {isEstoque && (
        <TouchableOpacity 
          style={styles.addButton} 
          activeOpacity={0.8}
          onPress={() => {
            if (global.onPressAddEstoque) {
              global.onPressAddEstoque();
            }
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666",
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
    zIndex: 1, // Camada inferior
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
  navLabelActive: {
    color: "#1E22AA",
    fontWeight: "bold",
  },

  addButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#1E22AA",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 28,
    marginTop: -2,
  },
});