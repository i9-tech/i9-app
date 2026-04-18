import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";

export default function ConfirmModal({
    visible,
    title = "Confirmar ação",
    message = "Tem certeza que deseja continuar?",
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
}) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.botoesContainer}>
                        <Pressable style={styles.btnSalvar} onPress={onConfirm}>
                            <Text style={styles.btnTextSalvar}>
                                {confirmText}
                            </Text>
                        </Pressable>

                        <Pressable style={styles.btnCancelar} onPress={onCancel}>
                            <Text style={styles.btnTextCancelar}>
                                {cancelText}
                            </Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
        marginBottom: 10,
    },
    message: {
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
    },
    botoesContainer: {
        flexDirection: "row",
        gap: 12,
    },
    btnSalvar: {
        flex: 1,
        backgroundColor: "#1E22AA",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    btnTextSalvar: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },
    btnCancelar: {
        flex: 1,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#000",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    btnTextCancelar: {
        color: "#000",
        fontWeight: "700",
        fontSize: 16,
    },
});