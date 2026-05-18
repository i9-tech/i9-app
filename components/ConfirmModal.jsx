import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel, confirmText, cancelText }) {
    const { t } = useTranslation();

    const tituloRender = title || t("componentes.confirm_modal.confirmar_acao");
    const mensagemRender = message || t("componentes.confirm_modal.tem_certeza_continuar");
    const textoConfirmar = confirmText || t("componentes.confirm_modal.confirmar");
    const textoCancelar = cancelText || t("componentes.confirm_modal.cancelar");

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{tituloRender}</Text>
                    <Text style={styles.message}>{mensagemRender}</Text>

                    <View style={styles.botoesContainer}>
                        <Pressable style={styles.btnSalvar} onPress={onConfirm}>
                            <Text style={styles.btnTextSalvar}>{textoConfirmar}</Text>
                        </Pressable>

                        <Pressable style={styles.btnCancelar} onPress={onCancel}>
                            <Text style={styles.btnTextCancelar}>{textoCancelar}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    container: { width: "100%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 12, padding: 20, elevation: 6 },
    title: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 10 },
    message: { fontSize: 14, color: "#555", marginBottom: 20 },
    botoesContainer: { flexDirection: "row", gap: 12 },
    btnSalvar: { flex: 1, backgroundColor: "#1E22AA", padding: 15, borderRadius: 8, alignItems: "center" },
    btnTextSalvar: { color: "#FFF", fontWeight: "700", fontSize: 16 },
    btnCancelar: { flex: 1, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#000", padding: 15, borderRadius: 8, alignItems: "center" },
    btnTextCancelar: { color: "#000", fontWeight: "700", fontSize: 16 }
});