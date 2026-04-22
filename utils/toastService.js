import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { toast } from "react-toastify";

export function showToast({ type = "info", message, description }) {
  if (Platform.OS === "web") {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
    });
  } else {
    Toast.show({
      type,
      text1: message,
      text2: description,
      visibilityTime: 3000,
    });
  }
}

export function showLoading(message = "Carregando...") {
  if (Platform.OS === "web") {
    return toast.loading(message);
  } else {
    Toast.show({
      type: "info",
      text1: message,
      autoHide: false,
    });
    return "loading";
  }
}

export function updateToast(id, { type, message }) {
  if (Platform.OS === "web") {
    toast.update(id, {
      render: message,
      type: toast[type],
      isLoading: false,
      autoClose: 3000,
    });
  } else {
    Toast.hide();
    Toast.show({
      type,
      text1: message,
    });
  }
}