import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SearchResultScreen from "./screens/SearchResultScreen";
import ItemScreen from "./screens/ItemScreen";
import CreateListScreen from "./screens/CreateListScreen";
import ListsScreen from "./screens/ListsScreen";
import ListDetailsScreen from "./screens/ListDetailsScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import AccountScreen from "./screens/AccountScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

const CustomHeaderTitle = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Home")}
      style={{ marginLeft: 20 }}
    >
      <View>
        <Text style={{ color: "#6666FF", fontWeight: "bold", fontSize: 16 }}>
          Smart
        </Text>
        <Text style={{ color: "#C87E61", fontWeight: "bold", fontSize: 16 }}>
          Shopper
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HeaderRight = () => {
  const navigation = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedLoginStatus = await AsyncStorage.getItem("isLoggedIn");
        setIsLoggedIn(storedLoginStatus === "true");
      } catch (error) {
        console.error("Error reading login status from AsyncStorage:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handlePress = () => {
    if (isLoggedIn) {
      navigation.navigate("Account");
    } else {
      navigation.navigate("Login");
    }
  };

  return (
    <TouchableOpacity style={{ marginRight: 20 }} onPress={handlePress}>
      <MaterialIcons name="account-circle" size={40} color="black" />
    </TouchableOpacity>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTitle: "",
          headerRight: () => <HeaderRight />,
          headerLeft: () => <CustomHeaderTitle />,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SearchResult" component={SearchResultScreen} />
        <Stack.Screen name="Item" component={ItemScreen} />
        <Stack.Screen name="CreateList" component={CreateListScreen} />
        <Stack.Screen name="Lists" component={ListsScreen} />
        <Stack.Screen name="ListDetails" component={ListDetailsScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        {/* Add ItemScreen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
