import { useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";

export default function Estoque() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        // backgroundColor: "blue",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Text>Tela de Estoque</Text>
      </View>
      <Pressable
        style={{
          backgroundColor: "white",
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
        onPress={() => {
          router.back();
        }}
      >
        <Text>Sair</Text>
      </Pressable>
    </View>
  );
}
