import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function ModalNotificacao({ visible, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("componentes.modal_esqueceu_senha_sucesso.titulo")}</Text>
            <Text style={styles.subtitle}>{t("componentes.modal_esqueceu_senha_sucesso.subtitulo")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.text}>{t("componentes.modal_esqueceu_senha_sucesso.msg_1")}</Text>
            <Text style={styles.text}>{t("componentes.modal_esqueceu_senha_sucesso.msg_2")}</Text>
            <Text style={styles.small}>{t("componentes.modal_esqueceu_senha_sucesso.aviso")}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 16 },
  container: { width: "100%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  header: { backgroundColor: "#0822c9", paddingVertical: 24, paddingHorizontal: 20, alignItems: "center", position: "relative" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", textAlign: "center" },
  subtitle: { color: "#fff", fontSize: 14, marginTop: 4, textAlign: "center" },
  closeButton: { position: "absolute", top: 12, right: 12 },
  closeText: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  content: { padding: 24 },
  text: { fontSize: 14, color: "#333", marginBottom: 12, lineHeight: 20 },
  small: { fontSize: 11, color: "#666", marginTop: 10, fontStyle: "italic" }
});