import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

// ==========================================
// ARMAZENAMENTO GERAL (AsyncStorage) || dados não sensíveis
// ==========================================

export const salvarUsuario = async (dadosUsuario) => {
  try {
    const jsonValue = JSON.stringify(dadosUsuario);
    await AsyncStorage.setItem("funcionario", jsonValue);
    await AsyncStorage.setItem("logado", "true");
  } catch (error) {
    console.error("Erro ao salvar os dados do usuário:", error);
  }
};

export const buscarUsuario = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("funcionario");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    return null;
  }
};

export const verificarLogin = async () => {
  try {
    const logado = await AsyncStorage.getItem("logado"); 
    return logado === "true"; 
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
};

export const removerUsuario = async () => {
  try {
    await AsyncStorage.removeItem("funcionario");
    await AsyncStorage.removeItem("logado");
  } catch (error) {
    console.error("Erro ao remover os dados do usuário:", error);
  }
};

// ==========================================
// ARMAZENAMENTO SEGURO (SecureStore) || Tokens, Senhas e dados críticos
// ==========================================

export const salvarToken = async (token) => {
  try {
    await SecureStore.setItemAsync("token", token);
  } catch (error) {
    console.error("Erro ao salvar o token seguro:", error);
  }
};

export const recuperarToken = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    return token;
  } catch (error) {
    console.error("Erro ao recuperar o token seguro:", error);
    return null;
  }
};

export const deletarToken = async () => {
  try {
    await SecureStore.deleteItemAsync("token");
  } catch (error) {
    console.error("Erro ao deletar o token seguro:", error);
  }
};

// ==========================================
// UTILITÁRIOS DE TOKEN
// ==========================================

export const descriptografarTokenJWT = (token) => {
  try {
    if (!token) return null;
    const payload = jwtDecode(token);
    return payload;
  } catch (error) {
    console.error("Erro ao decodificar o token JWT:", error);
    return null;
  }
};
