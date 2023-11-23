import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import axios from "axios";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    axios
      .post("http://localhost:3000/users", { username, password })
      .then((response) => {
        if (response.status === 201) {
          // Registration was successful (status code 201 Created)
          console.log("User registered:", response.data);

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
    <View>
      <Text>Register</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />
      <Button title="Register" onPress={handleRegister} />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}
