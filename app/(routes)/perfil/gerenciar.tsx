import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { db, storage } from "@/config/FirebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { TextInputMask } from "react-native-masked-text";
import { router, useNavigation } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";
import CryptoJS from "crypto-js";

export default function GerenciarPerfilScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [userType, setUserType] = useState<string>("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  const SenhaCriptografia = (password: string) => {
    return CryptoJS.SHA256(password).toString();
  };

  const buscarUsuario = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const q = query(collection(db, "Usuario"), where("id", "==", userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const usuarioData = querySnapshot.docs[0].data() as User;
          setUser(usuarioData);
          setEditedUser(usuarioData); // Preenche diretamente o estado com o usuário para edição
          setUserType(usuarioData.tipoUsuario); // Definir o tipo de usuário atual
        }
      }
    } catch (error) {
      console.error("Erro ao buscar usuário: ", error);
    }
  };

  useEffect(() => {
    buscarUsuario();
  }, []);

  const concluirEdicao = async () => {
    if (editedUser) {
      setLoading(true);
      try {
        let avatarUrl = editedUser.avatarUrl;

        // Verificar e fazer o upload da nova imagem de perfil, se houver uma nova
        if (editedUser.avatarUrl && editedUser.avatarUrl !== user?.avatarUrl) {
          const avatarUploadUrl = await uploadImage(
            editedUser.avatarUrl,
            `BonPoint/${editedUser.id}/ImagemUsuarioMoficado/avatar`
          );
          avatarUrl = avatarUploadUrl;
        }

        const tipoUsuarioValido =
          userType || user?.tipoUsuario || "Confeiteiro";

        let senhaAtualizada = user!.senha; // Caso a senha não seja alterada, mantém o valor atual

        // Se estiver alterando a senha, criptografa a nova senha
        if (isChangingPassword) {
          if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert(
              "Erro",
              "Preencha todos os campos para trocar a senha."
            );
            setLoading(false);
            return;
          }

          if (SenhaCriptografia(oldPassword) !== user?.senha) {
            Alert.alert("Erro", "A senha antiga está incorreta.");
            setLoading(false);
            return;
          }

          if (newPassword !== confirmPassword) {
            Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
            setLoading(false);
            return;
          }

          senhaAtualizada = SenhaCriptografia(newPassword);
        }

        console.log(" TEste a", editedUser.id);

        await setDoc(doc(db, "Usuario", editedUser.id), {
          ...editedUser,
          avatarUrl,
          tipoUsuario: tipoUsuarioValido,
          senha: senhaAtualizada,
        });

        console.log("B Teste ", editedUser.id);

        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        setUser({
          ...editedUser,
          avatarUrl,
          tipoUsuario: tipoUsuarioValido,
          senha: senhaAtualizada,
        });

        // Redefinir os estados
        setIsChangingPassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.push(`/(tabs)/profile`);
      } catch (error) {
        console.error("Erro ao atualizar perfil: ", error);
        Alert.alert("Erro", "Erro ao atualizar perfil.");
      } finally {
        setLoading(false);
      }
    }
  };

  const iniciarTrocaSenha = () => {
    setIsChangingPassword(true);
  };

  const trocarSenha = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos para trocar a senha.");
      return;
    }

    // Verifica se a senha antiga está correta (compara hash)
    if (SenhaCriptografia(oldPassword) !== user?.senha) {
      Alert.alert("Erro", "A senha antiga está incorreta.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
      return;
    }

    try {
      setLoading(true);
      // Criptografa a nova senha
      const hashedNewPassword = SenhaCriptografia(newPassword);

      // Atualiza a senha no banco de dados
      await setDoc(doc(db, "Usuario", user!.id), {
        ...user,
        senha: hashedNewPassword,
      });

      Alert.alert("Sucesso", "Senha atualizada com sucesso!");
      setUser({ ...user!, senha: hashedNewPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
      router.push(`/(tabs)/profile`);
    } catch (error) {
      console.error("Erro ao trocar senha: ", error);
      Alert.alert("Erro", "Erro ao trocar a senha.");
    } finally {
      setLoading(false);
    }
  };

  const deletarPerfil = async () => {
    Alert.alert(
      "Confirmação",
      "Você realmente deseja excluir sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir Conta",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Usuario", user!.id));
              Alert.alert("Sucesso", "Conta excluída com sucesso!");
              await AsyncStorage.removeItem("userId");
              await AsyncStorage.removeItem("access_token");
              router.replace("/login");
            } catch (error) {
              console.error("Erro ao excluir conta: ", error);
              Alert.alert("Erro", "Erro ao excluir conta.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const uploadImage = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditedUser({ ...editedUser!, avatarUrl: result.assets[0].uri });
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ fontSize: 18, color: "#Fff" }}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.containerDois}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.confeitariaItem}>
          <Text style={styles.titulo}>Editar Usuário</Text>
          <View>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{
                  uri: editedUser?.avatarUrl || user.avatarUrl,
                }}
                style={styles.confeitariaImage}
              />
              <View style={styles.backgroundIcon}>
                <Ionicons name="camera" size={43} style={styles.cameraIcon} />
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign
              name="arrowleft"
              size={22}
              color="#fff"
              style={styles.backButtonText}
            />
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome:</Text>
            <TextInput
              style={styles.input}
              value={editedUser?.nome}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser!, nome: text })
              }
              placeholder="Digite seu nome"
              placeholderTextColor="#fff"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={editedUser?.email}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser!, email: text })
              }
              placeholder="Digite seu email"
              placeholderTextColor="#fff"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone:</Text>
            <TextInputMask
              type={"cel-phone"}
              options={{
                maskType: "BRL",
                withDDD: true,
                dddMask: "(99) ",
              }}
              style={styles.input}
              value={editedUser?.telefone}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser!, telefone: text })
              }
              placeholder="Digite seu telefone"
              placeholderTextColor="#fff"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Usuário:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userType}
                style={styles.picker}
                onValueChange={(itemValue: string) => setUserType(itemValue)}
              >
                <Picker.Item
                  style={styles.labelPicker}
                  label="Confeiteiro"
                  value="Confeiteiro"
                />
                <Picker.Item
                  style={styles.labelPicker}
                  label="Organizador"
                  value="Organizador"
                />
              </Picker>
            </View>
          </View>

          {/* Seção de troca de senha */}
          <View style={styles.passwordContainer}>
            {!isChangingPassword ? (
              <TouchableOpacity
                onPress={iniciarTrocaSenha}
                style={styles.changePasswordButton}
              >
                <Text style={styles.changePasswordText}>Trocar de Senha</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.tituloDois}>Nova Senha</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Senha Atual</Text>
                  <View style={styles.passwordField}>
                    <TextInput
                      style={styles.inputDois}
                      value={oldPassword}
                      onChangeText={(text) => setOldPassword(text)}
                      secureTextEntry={!showOldPassword}
                      placeholder="Digite sua senha atual"
                      placeholderTextColor="#fff"
                    />
                    <TouchableOpacity
                      onPress={() => setShowOldPassword(!showOldPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showOldPassword ? "eye-off" : "eye"}
                        size={28}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <View style={styles.passwordField}>
                    <TextInput
                      style={styles.inputDois}
                      value={newPassword}
                      onChangeText={(text) => setNewPassword(text)}
                      secureTextEntry={!showNewPassword}
                      placeholder="Digite sua nova senha"
                      placeholderTextColor="#fff"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showNewPassword ? "eye-off" : "eye"}
                        size={28}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar Nova Senha</Text>
                  <View style={styles.passwordField}>
                    <TextInput
                      style={styles.inputDois}
                      value={confirmPassword}
                      onChangeText={(text) => setConfirmPassword(text)}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirme sua nova senha"
                      placeholderTextColor="#fff"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={28}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={trocarSenha}
                  style={styles.actionButtonDois}
                >
                  <Text style={styles.actionButtonText}>
                    Confirmar Troca de Senha
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsChangingPassword(false); // Cancela a troca de senha
                    setOldPassword(""); // Limpa os campos
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  style={styles.actionButtonDois}
                >
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={concluirEdicao}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Concluir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={deletarPerfil}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Excluir Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  containerDois: {
    flex: 1,
    padding: 10,
  },
  confeitariaItem: {
    backgroundColor: Colors.BonPoint.Segundaria,
    borderRadius: 24,
    padding: 16,
    marginVertical: 4,
    marginBottom: 18,
  },
  titulo: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    marginLeft: 8,
    color: Colors.BonPoint.Primaria,
    marginBottom: 6,
  },
  tituloDois: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    alignItems: "center",
    color: Colors.BonPoint.Primaria,
    marginBottom: -6,
    marginTop: -6,
  },
  confeitariaImage: {
    width: 260,
    height: 260,
    borderRadius: 99999,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#fff",
    resizeMode: "cover",
    alignSelf: "center", // Centraliza a imagem
    paddingBottom: 40,
  },
  backgroundIcon: {
    backgroundColor: "#fff",
    borderRadius: 99,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: -20,
    alignSelf: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 7,
    color: "#4175c4",
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  inputContainer: {
    marginTop: 15,
  },
  input: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    padding: 10,
    color: "#fff",
    fontSize: 19,
  },
  inputDois: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    color: "#fff",
    fontSize: 19,
  },
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
  },
  eyeIcon: {
    padding: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.BonPoint.Branco,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: "center",
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    height: 55,
    width: "100%",
    color: Colors.BonPoint.Branco,
  },
  labelPicker: {
    fontSize: 20,
  },
  passwordContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  changePasswordButton: {
    backgroundColor: "#4175c4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: -10,
  },
  changePasswordText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#4175c4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "30%",
  },
  actionButtonDois: {
    backgroundColor: "#4175c4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 12,
  },

  actionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#4175c4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  backButtonText: {
    fontSize: 36,
    color: Colors.BonPoint.Branco,
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: "#4175c4",
    borderRadius: 99,
    position: "absolute",
    top: 10,
    alignItems: "center",
    justifyContent: "center",
    left: 10,
  },
  cancelButton: {
    backgroundColor: Colors.BonPoint.Vermelho, // Cor de fundo para indicar cancelamento
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  changePasswordActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
