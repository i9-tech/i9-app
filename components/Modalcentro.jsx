import { View, Text, StyleSheet, Modal as RNModal, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ModalCentro(props) {
  const conteudo = (
    <View style={styles.overlay}>
      <View style={styles.modal}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.titulo}>
            {props.titulo || "Título do modal"}
          </Text>
          <Pressable onPress={props.onClose} style={styles.botaoFechar}>
            <Ionicons name="close" size={24} color="#333" />
          </Pressable>
        </View>

        {/* CORPO */}
        <View style={styles.corpo}>
          {props.children}
        </View>

      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return conteudo;
  }

  return (
    <RNModal
      transparent={true}
      visible={true}
      animationType="fade"
      onRequestClose={props.onClose}
    >
      {conteudo}
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: Platform.OS === "web" ? "fixed" : "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 24,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 480,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
  botaoFechar: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 5,
  },
  corpo: {
    flex: 1,
    width: "100%",
  },
});