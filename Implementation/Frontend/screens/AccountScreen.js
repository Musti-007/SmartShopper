import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const AccountScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem("firstName");
        const storedLastName = await AsyncStorage.getItem("lastName");
        const storedEmail = await AsyncStorage.getItem("email");

        setFirstName(storedFirstName);
        setLastName(storedLastName);
        setEmail(storedEmail);
      } catch (error) {
        console.error("Error reading user data from AsyncStorage:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    try {
      // Fetch user data from AsyncStorage or your user authentication system
      const storedUserId = await AsyncStorage.getItem("userId");

      // Save the updated user information to the server
      await axios.put(`http://localhost:3000/users/${storedUserId}`, {
        firstName,
        lastName,
        email,
      });

      // Optionally, you can also update the user information in your state or context
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#371E57", "#0E1223"]}
      style={styles.linearGradient}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <AntDesign name="left" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greetingText}>Welcome, {firstName}!</Text>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.editIcon} onPress={handleEditPress}>
            <AntDesign name="edit" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.label}>First Name:</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name:</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false} // Email is not editable in this example
          />
        </View>
        <View style={styles.groupbutton}>
          {isEditing && (
            <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  greetingText: {
    fontSize: 40,
    marginTop: 40,
    marginBottom: 40,
    alignSelf: "flex-start",
    padding: 20,
    color: "white",
  },
  editIcon: {
    alignSelf: "flex-end",
    paddingRight: 20,
  },
  label: {
    marginBottom: 5,
    paddingLeft: 15,
    fontSize: 16,
    color: "white",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 40,
    paddingHorizontal: 8,
    fontSize: 16,
    width: "94%",
    alignSelf: "center",
    color: "white",
  },
  groupbutton: {
    marginTop: 90,
  },
  button: {
    width: "50%",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
    backgroundColor: "#6666FF",
    // marginBottom: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AccountScreen;
