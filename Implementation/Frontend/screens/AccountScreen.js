import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        setUsername(storedUsername);
      } catch (error) {
        console.error("Error reading username from AsyncStorage:", error);
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear AsyncStorage or remove specific user-related data
      await AsyncStorage.clear();

      // // Navigate to the login screen
      // navigation.navigate('Login');

      // Reset the navigation stack and navigate to the login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.usernameText}>Welcome, {username}!</Text>
      <Button title="Logout" onPress={handleLogout} />
      {/* Add more components or functionality as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default AccountScreen;
