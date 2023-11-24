import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  CheckBox,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import bcrypt from "react-native-bcrypt";

export default function App({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        // User is already logged in, navigate to Home
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  const handleLogin = () => {
    axios
      .post("http://localhost:3000/login", { email, password })
      .then((response) => {
        // Handle successful login response
        console.log("Login successful:", response.data);

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("isLoggedIn", "true");

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("userId", response.data.userId);

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("email", response.data.email);

        // You can perform navigation or set user state accordingly
        navigation.navigate("Home");
      })
      .catch((error) => {
        // Handle login error
        console.error("Login failed:", error.response.data);
        Alert.alert(
          "Login Failed",
          "Please check your email and password and try again."
        );
        // Display an error message or perform other actions as needed
      });
  };

  return (
    <View style={styles.body}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your email and password.</Text>
      <View style={styles.container}>
        <View style={styles.inputView}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor="#003f5c"
            onChangeText={(email) => setEmail(email)}
          />
        </View>
        <View style={styles.inputView}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor="#003f5c"
            secureTextEntry={!showPassword}
            onChangeText={(password) => setPassword(password)}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 10, top: 10 }}
          >
            <Icon
              style={styles.passwordshowicon}
              name={showPassword ? "eye" : "eye-slash"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={keepLoggedIn}
            onValueChange={setKeepLoggedIn}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxLabel}>Keep me logged in</Text>
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={{ color: "white" }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.forgotButton}>
          <Text>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={{ color: "blue" }}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: "#f0f0f0",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    // alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingLeft: 15,
  },
  title: {
    fontSize: 40,
    marginTop: 40,
    marginBottom: 40,
    alignSelf: "flex-start",
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    paddingLeft: 15,
  },
  inputView: {
    width: "95%",
    marginBottom: 40,
    // borderWidth: 1,
  },
  label: {
    marginBottom: 5,
  },
  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "black",
  },
  passwordshowicon: {
    height: 50,
    flex: 1,
    paddingTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  loginBtn: {
    width: "80%",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
    backgroundColor: "#6666FF",
    marginBottom: 30,
  },
  forgotButton: {
    height: 30,
    marginBottom: 20,
    alignSelf: "center",
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 100,
    alignSelf: "center",
  },
  signupText: {
    marginRight: 5,
  },
  signupButton: {},
});
