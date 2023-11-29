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
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";

export default function App({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setChecked] = useState(false);
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

        // Set the 'isLoggedIn' flag in AsyncStorage to true
        AsyncStorage.setItem("firstName", response.data.firstName);

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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your email and password.</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your email"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your password"
          value={password}
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
        <View style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#4630EB" : undefined}
          />
          <Text style={styles.checkboxLabel}>Keep me logged in</Text>
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={{ color: "white" }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotButton}>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.signupButton}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    // flex: 1,
    // backgroundColor: "#f0f0f0",
    // // alignItems: "center",
    // marginTop: 20,
    // marginBottom: 20,
    // paddingLeft: 15,
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
    paddingLeft: 20,
  },
  label: {
    marginBottom: 5,
    paddingLeft: 20,
    fontSize: 16,
  },
  textInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 32,
    paddingHorizontal: 8,
    fontSize: 16,
    width: "94%",
    alignSelf: "center",
  },
  passwordshowicon: {
    flex: 1,
    paddingTop: 120,
    paddingRight: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginLeft: 15,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 5,
  },
  loginBtn: {
    width: "50%",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
    backgroundColor: "#6666FF",
    marginBottom: 30,
    // fontSize: 16,
  },
  forgotButton: {
    height: 30,
    marginBottom: 20,
    alignSelf: "center",
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 100,
    alignSelf: "center",
  },
  signupText: {
    marginRight: 5,
    fontSize: 16,
  },
  signupButton: {
    color: "#C87E61",
    fontWeight: "bold",
    fontSize: 16,
  },
});
