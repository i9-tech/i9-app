import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function CampoImagem({ imagemUri, onImageSelected, label, required }) {

    const selecionarImagem = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert("Permissão necessária", "Precisamos acessar suas fotos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            const filename = asset.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            onImageSelected({
                uri: asset.uri,
                name: filename || "foto.jpg",
                type: type,
            });
        }
    };

    return (
        <View style={styles.inputGroup}>
            {label && (
                <Text style={styles.label}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}

            <TouchableOpacity
                style={styles.uploadBox}
                onPress={selecionarImagem}
                activeOpacity={0.8}
            >
                {imagemUri ? (
                    <>
                        <Image source={{ uri: imagemUri }} style={styles.imagemPreview} />
                        <View style={styles.overlay}>
                            <Ionicons name="pencil" size={18} color="#FFF" />
                            <Text style={styles.overlayText}>Alterar imagem</Text>
                        </View>
                    </>
                ) : (
                    <>
                        <Ionicons name="cloud-upload-outline" size={32} color="#0F14B8" />
                        <Text style={styles.uploadTitle}>Enviar imagem</Text>
                        <Text style={styles.uploadSubtitle}>
                            Toque para selecionar uma foto
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
        width: "100%",
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    required: {
        color: "red",
    },
    uploadBox: {
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#0F14B8",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9FAFF",
        overflow: "hidden",
        width: "100%",     
        aspectRatio: 1,     
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    uploadTitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "600",
        color: "#0F14B8",
    },
    uploadSubtitle: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
    imagemPreview: {
        width: "90%",
        height: "90%",
        resizeMode: "contain",
    },
    overlay: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: "#1E22AA",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    overlayText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
});