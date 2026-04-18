import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

export default function Toast({ visible, message, type, duration = 2500 }) {
  const progress = useRef(new Animated.Value(1)).current;

  function renderIcon() {
    if (type === "success") {
      return <Ionicons name="checkmark-circle" size={20} color="#22C55E" />;
    }
    if (type === "error") {
      return <Ionicons name="close-circle" size={20} color="#EF4444" />;
    }
    if (type === "loading") {
      return <ActivityIndicator size="small" color="#4F46E5" />;
    }
    return null;
  }

  function getColor() {
    if (type === "success") return "#22C55E";
    if (type === "error") return "#EF4444";
    return "#4F46E5";
  }

  useEffect(() => {
    if (visible && type !== "loading") {
      progress.setValue(1);

      const tempo =
        type === "success" ? 4000 :
          type === "error" ? 4000 :
            duration;

      Animated.timing(progress, {
        toValue: 0,
        duration: tempo,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, type]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.toast, { borderLeftColor: getColor() }]}>
          <View style={styles.row}>
            <View style={styles.icon}>{renderIcon()}</View>

            <Text style={styles.text} numberOfLines={2}>
              {message}
            </Text>
          </View>

          {/* Barra dinâmica */}
          {type !== "loading" && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: getColor(),
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 70,
  },

  toast: {
    width: "92%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginRight: 12,
  },

  text: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },

  progressContainer: {
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 12,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
});