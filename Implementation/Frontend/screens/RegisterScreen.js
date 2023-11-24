import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const handleRegister = () => {
    // Check if passwords match
    if (password !== repeatPassword) {
      console.error("Passwords do not match");
      return;
    }

    axios
      .post("http://localhost:3000/users", {
        firstName,
        lastName,
        email,
        password,
      })
      .then((response) => {
        if (response.status === 201) {
          // Registration was successful (status code 201 Created)
          console.log("User registered:", response.data);

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
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Repeat New Password"
          value={repeatPassword}
          onChangeText={(text) => setRepeatPassword(text)}
          secureTextEntry={true}
        />
      </View>
      <Button title="Register" onPress={handleRegister} />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    marginTop: 40,
    marginBottom: 60,
    alignSelf: "flex-start",
  },
  inputContainer: {
    marginBottom: 200,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
});
