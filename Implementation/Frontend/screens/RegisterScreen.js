import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const handleRegister = () => {
    // Check if any required field is empty
    if (!firstName || !lastName || !email || !password || !repeatPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Check if passwords match
    if (password !== repeatPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    axios
      .post("http://192.168.1.218:3000/users", {
        firstName,
        lastName,
        email,
        password,
      })
      .then((response) => {
        if (response.status === 201) {
          // Registration was successful (status code 201 Created)
          console.log("User registered:", response.data);

          // Show alert on successful registration
          Alert.alert("Success", "You have been successfully registered!");

          // Navigate to the Login screen
          navigation.navigate("Login");
        } else {
          // Registration failed, handle the error
          throw new Error("Failed to register");
        }
      })
      .catch((error) => {
        // Handle registration error
        console.error("Registration error:", error);
      });
  };

  return (
    <LinearGradient
      colors={["#371E57", "#0E1223"]}
      style={styles.linearGradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Registration</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="gray"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="gray"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Repeat New Password"
            placeholderTextColor="gray"
            value={repeatPassword}
            onChangeText={(text) => setRepeatPassword(text)}
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity style={styles.regButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.logbuttonText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.blueText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  title: {
    fontSize: 40,
    marginTop: 40,
    marginBottom: 40,
    alignSelf: "flex-start",
    padding: 20,
    color: "white",
  },
  inputContainer: {
    // marginBottom: 150,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 32,
    paddingHorizontal: 8,
    fontSize: 16,
    width: "94%",
    alignSelf: "center",
    color: "white",
  },
  regButton: {
    borderRadius: 10,
    width: "42%",
    height: 50,
    backgroundColor: "#6666FF",
    marginTop: 10,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    // fontSize: 16,
  },
  logbuttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  blueText: {
    color: "#C87E61",
    marginLeft: 5, // Add margin between "Already have an account?" and "Login"
    fontWeight: "bold",
    fontSize: 16,
  },
});
