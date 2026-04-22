import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal
} from "react-native";

export default function ModalSenha({ visible, onClose, onSubmit, disabled }) {
    const [cpf, setCpf] = useState("");

    const formatarCPF = (valor) => {
        valor = valor.replace(/\D/g, "");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return valor;
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* HEADER AZUL */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Esqueceu a Senha?</Text>
                        <Text style={styles.subtitle}>
                            Sem problemas! Informe seu CPF abaixo para continuar.
                        </Text>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* CONTEÚDO */}
                    <View style={styles.content}>
                        <Text style={styles.label}>Insira seu CPF</Text>

                        <TextInput
                            style={styles.input}
                            value={cpf}
                            placeholder="123.456.789-00"
                            placeholderTextColor="#999"
                            maxLength={14}
                            keyboardType="numeric"
                            editable={!disabled}
                            onChangeText={(text) => setCpf(formatarCPF(text))}
                        />

                        <TouchableOpacity
                            style={[styles.button, disabled && styles.buttonDisabled]}
                            onPress={() => onSubmit(cpf)}
                            disabled={disabled}
                        >
                            <Text style={styles.buttonText}>Enviar</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        width: "90%",
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: "#fff",
    },

    header: {
        backgroundColor: "#1E2BB8",
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: "center",
    },

    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 40,
    },

    closeButton: {
        position: "absolute",
        top: 10,
        right: 15,
    },

    closeText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },

    content: {
        backgroundColor: "#F4F4F6",
        padding: 20,
    },

    label: {
        fontSize: 14,
        color: "#333",
        marginBottom: 8,
        fontWeight: "500"
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 20,
    },

    button: {
        backgroundColor: "#1E2BB8",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },

    buttonDisabled: {
        backgroundColor: "#999",
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});