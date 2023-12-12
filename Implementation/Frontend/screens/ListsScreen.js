import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
      const response = await axios.get(
        // `http://192.168.1.218:3000/lists/${userID}`
        `http://localhost:3000/lists/${userID}`
      );

      // Update the state with the fetched lists using the callback version
      setLists((prevLists) => [...prevLists, ...response.data]);
    } catch (error) {
      console.error("Error fetching lists:", error.message);
      // Handle the error in a way that makes sense for your application
    }
  };

  const onDeleteList = async (listIndex) => {
    try {
      // Get the list ID of the list to be deleted
      const listIdToDelete = lists[listIndex].ListID;

      // Make a DELETE request to your server to delete the list
      // await axios.delete(`http://192.168.1.218:3000/lists/${listIdToDelete}`);
      await axios.delete(`http://localhost:3000/lists/${listIdToDelete}`);

      // Update the state to reflect the deletion
      const updatedLists = [...lists];
      updatedLists.splice(listIndex, 1);
      setLists(updatedLists);

      Alert.alert(`List "${lists[listIndex].ListName}" has been deleted.`);
    } catch (error) {
      console.error("Error deleting list:", error.message);
      // Handle the error in a way that makes sense for your application
    }
  };

  return (
    <LinearGradient
      colors={["#371E57", "#0E1223"]}
      style={styles.linearGradient}
    >
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Lists</Text>
        {lists.length === 0 ? (
          <Text style={styles.noListsMessage}>No lists to show.</Text>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(list, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.listContainer}>
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() =>
                    navigation.navigate("ListDetails", { list: item })
                  }
                >
                  <Text style={styles.listItemText}>{item.ListName}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeleteList(index)}>
                  <AntDesign style={styles.deleteButton} name="delete" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </LinearGradient>
  );
}

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
  title: {
    fontSize: 40,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
    padding: 20,
    color: "white",
  },
  listContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  listItem: {
    padding: 15,
    // marginBottom: 20,
  },
  listItemText: {
    color: "white",
    fontSize: 18,
  },
  deleteButton: {
    color: "red",
    paddingTop: 2,
    fontSize: 24,
  },
  noListsMessage: {
    color: "white",
    fontSize: 20,
    paddingLeft: 20,
  },
});

export default ListsScreen;
