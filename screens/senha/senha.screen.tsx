import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { db } from "@/config/FirebaseConfig"; // Firestore config
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore"; // Firestore methods
import { router } from "expo-router"; // Navigation for redirection
import { Ionicons } from "@expo/vector-icons"; // Icons
import CryptoJS from "crypto-js";

export default function SenhaScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [codigoGerado, setCodigoGerado] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false); // Controle de visibilidade da nova senha
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false); // Controle de visibilidade da confirmação de senha
  const inputRefs = useRef<TextInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const MudandacaDoInput = (text: string, index: number) => {
    // Permitir apenas números
    const newText = text.replace(/[^0-9]/g, "");

    const newCodigo = [...codigo];
    newCodigo[index] = newText;
    setCodigo(newCodigo);

    // Avança para o próximo campo automaticamente, se houver
    if (newText && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Verificar se o email existe no Firestore
  const verificarEmailNoBanco = async (email: string) => {
    const usuariosRef = collection(db, "Usuario");
    const q = query(usuariosRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const enviarCodigo = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu email.");
      return;
    }

    setIsLoading(true); // Ativa o carregamento
    try {
      const emailExiste = await verificarEmailNoBanco(email);
      if (!emailExiste) {
        Alert.alert("Erro", "Este email não está registrado.");
        return;
      }

      const codigoAleatorio = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      setCodigoGerado(codigoAleatorio);
      console.log("Codigo da Senha:", `${codigoAleatorio}`);

      const response = await fetch("http://192.168.1.2:3000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, codigo: codigoAleatorio }),
      });

      if (response.ok) {
        Alert.alert("Código Enviado", `Um código foi enviado para ${email}`);
        setStep(2); // Avançar para o próximo passo
      } else {
        const errorMessage = await response.text();
        throw new Error(`Falha ao enviar o e-mail: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || "Erro desconhecido";
      console.error("Erro ao enviar e-mail:", errorMessage);
      Alert.alert(
        "Erro",
        `Falha ao enviar o código. Detalhes: ${errorMessage}`
      );
    } finally {
      setIsLoading(false); // Desativa o carregamento
    }
  };

  const validarSenha = (senha: string) => {
    const senhaMinima = 6; // Mínimo de 6 caracteres
    const regexNumero = /\d/; // Verifica se contém um número
    const regexEspecial = /[!@#$%^&*(),.?":{}|<>]/; // Verifica se contém um caractere especial

    if (senha.length < senhaMinima) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    if (!regexNumero.test(senha)) {
      Alert.alert("Erro", "A senha deve conter pelo menos um número.");
      return false;
    }
    if (!regexEspecial.test(senha)) {
      Alert.alert(
        "Erro",
        "A senha deve conter pelo menos um caractere especial."
      );
      return false;
    }
    return true; // Senha válida
  };

  const validarCodigo = () => {
    const codigoInserido = codigo.join(""); // Junta o array em uma string única

    if (codigoInserido.length < 6) {
      Alert.alert("Erro", "Por favor, insira um código de 6 dígitos.");
      return;
    }

    if (codigoInserido !== codigoGerado) {
      Alert.alert("Erro", "Código inválido. Tente novamente.");
      return;
    }

    setStep(3); // Avançar para o passo de redefinir a senha
  };

  const definirNovaSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert("Erro", "Por favor, insira e confirme sua nova senha.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem. Tente novamente.");
      return;
    }

    // Validação da nova senha
    if (!validarSenha(novaSenha)) {
      return; // Se a senha não for válida, não continua
    }

    try {
      const usuariosRef = collection(db, "Usuario");
      const q = query(usuariosRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(db, "Usuario", userDoc.id);

        // Criptografar a nova senha
        const senhaCriptografada = CryptoJS.SHA256(novaSenha).toString();

        // Atualizar o documento do usuário com a nova senha criptografada
        await updateDoc(userDocRef, {
          senha: senhaCriptografada,
        });

        Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!");

        // Redirecionar para a tela de login
        router.replace("/(routes)/login");
      }
    } catch (error) {
      const errorMessage = (error as Error).message || "Erro desconhecido";
      console.error("Erro ao alterar senha:", errorMessage);
      Alert.alert(
        "Erro",
        `Falha ao alterar a senha. Detalhes: ${errorMessage}`
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {step === 1 && (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Esqueceu a senha?</Text>
            <Text style={styles.emailTexto}>Insira seu e-mail</Text>
            <TextInput
              placeholder="exemplo@gmail.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.button} onPress={enviarCodigo}>
              <Text style={styles.buttonText}>Enviar Email</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Insira o código</Text>
            <Text style={styles.label}>
              Chegou seu e-mail com o código? Preencha esses campos.
            </Text>
            <View style={styles.codeContainer}>
              {codigo.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={digit}
                  onChangeText={(text) => MudandacaDoInput(text, index)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={validarCodigo}>
              <Text style={styles.buttonText}>Confirmar Código</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Crie uma nova senha</Text>
            {/* Campo de nova senha com ícone para mostrar/ocultar senha */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Insira sua nova senha"
                secureTextEntry={!senhaVisivel}
                style={styles.input}
                value={novaSenha}
                onChangeText={setNovaSenha}
              />
              <TouchableOpacity
                onPress={() => setSenhaVisivel(!senhaVisivel)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={senhaVisivel ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                  style={styles.iconOlho}
                />
              </TouchableOpacity>
            </View>

            {/* Campo de confirmar nova senha com ícone para mostrar/ocultar senha */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirme sua nova senha"
                secureTextEntry={!confirmarSenhaVisivel}
                style={styles.input}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity
                onPress={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={confirmarSenhaVisivel ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                  style={styles.iconOlho}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={definirNovaSenha}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              Dica: guarde essa nova senha para você usar sempre que acessar o
              nosso Bon Point.
            </Text>
          </View>
        )}

        {/* Contêiner das imagens ajustado com texto sobreposto */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/caixa-2.png")}
            style={styles.caixa}
          />
          {/* Texto sobreposto à imagem da caixa */}
          <Text style={styles.overlayText}>
            Jorge, guarde essa nova senha para você usufruir sem estresse o
            nosso Bon Point.
          </Text>
          <Image
            source={require("../../assets/images/jorge-2.png")}
            style={styles.jorge}
          />
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Carregando...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#658ECE",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    marginBottom: 120,
  },
  loadingContainer: {
    position: "absolute", // Torna o View uma sobreposição
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo semitransparente
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Garante que fique acima de outros elementos
  },
  formContainer: {
    zIndex: 1,
    backgroundColor: "#F7F6FB",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    color: "#000",
    marginBottom: 10,
  },
  emailTexto: {
    width: "100%",
    marginBottom: 2,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 15,
    height: 45,
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 10,
    width: "97%",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 3,
    width: "100%",
  },
  codeInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 1000,
    padding: 12,
    width: 50,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    bottom: 5,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4175C4",
    padding: 10,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hint: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  // Novo estilo para o contêiner das imagens
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -290,
  },
  jorge: {
    width: 260,
    height: 280,
    top: 237,
    right: 80,
    zIndex: 2, // Defina um valor de zIndex maior para trazer a imagem à frente
  },
  caixa: {
    top: 225,
    right: 20,
    width: 225,
    height: 120,
    zIndex: 3, // Defina um valor de zIndex maior para garantir que esteja à frente
  },
  overlayText: {
    position: "absolute",
    top: 320,
    left: -8,
    width: 200,
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    zIndex: 4, // Defina um valor de zIndex menor para o texto
  },
  iconOlho: {
    alignItems: "center",
    marginBottom: 3,
  },
});
