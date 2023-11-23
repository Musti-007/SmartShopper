import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

function ListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    // Fetch lists from the server when the component mounts
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      // Get the user ID from AsyncStorage
      const userID = await AsyncStorage.getItem("userId"); // Replace 'userId' with your actual key

      // Fetch lists from the server using axios and the user ID
      const response = await axios.get(`http://localhost:3000/lists/${userID}`);
      console.log("Response data:", response.data);

      // Update the state with the fetched lists using the callback version
      setLists((prevLists) => [...prevLists, ...response.data]);
    } catch (error) {
      console.error("Error fetching lists:", error.message);
      // Handle the error in a way that makes sense for your application
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lists</Text>
      <FlatList
        data={lists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate("ListDetails", { list: item })}
          >
            <Text style={styles.listItemText}>{item.ListName}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  listItemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ListsScreen;
