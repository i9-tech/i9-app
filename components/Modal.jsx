import { View, Text, StyleSheet, Modal as RNModal } from "react-native";

export default function Modal(props) {
  return (
    <RNModal
      transparent={true} 
      visible={true}     
      animationType="slide" 
      onRequestClose={props.onClose} 
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>{props.titulo || "Título do modal"}</Text>
          
          <View style={styles.corpo}>
            {props.children}
          </View>
          
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    width: '100%', 
    minHeight: '35%',
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
  },
  titulo: {
    fontSize: 21,
    fontWeight: 'bold',
    paddingBottom: 15,
    paddingTop: 10,
    textAlign: 'center', 
  },
  corpo: {
    flex: 1,
    width: '100%',
  }
});