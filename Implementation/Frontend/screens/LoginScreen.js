import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      .post("http://localhost:3000/login", { username, password })
      .then((response) => {
        // Handle successful login response
        console.log("Login successful:", response.data);

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("isLoggedIn", "true");

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("userId", response.data.userId);

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("username", response.data.username);

        // You can perform navigation or set user state accordingly
        navigation.navigate("Home");
      })
      .catch((error) => {
        // Handle login error
        console.error("Login failed:", error.response.data);
        Alert.alert(
          "Login Failed",
          "Please check your username and password and try again."
        );
        // Display an error message or perform other actions as needed
      });
  };

  return (
    <View style={styles.body}>
      <Text style={styles.title}>Login</Text>
      <Text>Enter your username and password.</Text>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            placeholderTextColor="#003f5c"
            onChangeText={(username) => setUsername(username)}
          />
        </View>
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#003f5c"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotButton}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={{ color: "white" }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={{ color: "white" }}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  body: {
    backgroundColor: "white",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 60,
  },
  image: {
    marginBottom: 40,
  },
  inputView: {
    backgroundColor: "white",
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "black",
    width: "70%",
    height: 45,
    marginBottom: 20,
    alignItems: "center",
  },
  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
    textAlign: "center",
  },
  forgotButton: {
    height: 30,
    marginBottom: 30,
  },
  loginBtn: {
    width: "80%",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: "#6666FF",
  },
});
