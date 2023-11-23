import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { SearchBar, Card } from "react-native-elements";
import { AntDesign } from "@expo/vector-icons";

function CreateListScreen({ navigation }) {
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = async (text) => {
    setItemName(text);

    const searchTextLower = text.toLowerCase();
    const filteredItems = [];
    const data = await axios.get("http://localhost:3000/api/data");

    for (const section of data.data) {
      for (const product of section.d) {
        if (product.n.toLowerCase().includes(searchTextLower)) {
          filteredItems.push({
            n: product.n,
            p: product.p,
            i: section.i,
          });
        }
      }
    }

    if (text.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    setFilteredProducts(filteredItems);
  };

  const handleItemPress = (item) => {
    setItems([
      ...items,
      { name: item.n, price: item.p, store: item.supermarket },
    ]);

    setItemName("");
    setFilteredProducts([]);
  };

  const onDeleteItem = (itemIndex) => {
    // Filter out the item with the specified itemId
    const updatedItems = items.filter((item, index) => index !== itemIndex);
    // Update the state to reflect the deletion
    setItems(updatedItems);
  };

  const handleCreateList = async () => {
    if (items.length === 0) {
      return;
    }

    try {
      // Make a POST request to create a new list using Axios
      const response = await axios.post("http://losthost:3000/lists", {
        name: listName,
        items: items,
      });

      // Assuming your API returns the created list in the response.data
      const newList = response.data;

      // Reset state after creating the list
      setListName("");
      setItems([]);

      // Navigate to the ListsScreen with the new list for display
      navigation.navigate("Lists");
    } catch (error) {
      console.error("Error creating list:", error.message);
      // Handle the error in a way that makes sense for your application
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Grocery List</Text>
      <TextInput style={styles.listinput} placeholder=" Enter list name" />
      <SearchBar
        inputContainerStyle={styles.searchinputcontainer}
        containerStyle={styles.searchcontainer}
        inputStyle={styles.searchinput}
        placeholder="Add item"
        onChangeText={(text) => handleSearch(text)}
        value={itemName}
      />
      {filteredProducts.length > 0 && (
        <View style={styles.searchdropdownContainer}>
          <FlatList
            data={filteredProducts.slice(0, 10)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleItemPress(item)}>
                <Card style={styles.card}>
                  <Card.Image
                    source={{ uri: item.i }}
                    style={styles.cardImage}
                  />
                  <Text style={styles.productName}>{item.n}</Text>
                  <Text style={styles.productPrice}>€{item.p}</Text>
                </Card>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <View style={styles.itemlistbox}>
        <FlatList
          data={items}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemText}>{item.name}</Text>
              <TouchableOpacity onPress={() => onDeleteItem(index)}>
                <View style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>x</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCreateList}>
        <Text style={styles.buttonText}>Create List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 40,
    marginTop: 40,
    marginBottom: 40,
    alignSelf: "flex-start",
    padding: 20,
  },
  searchcontainer: {
    backgroundColor: "#E2E8EE",
    border: 0,
  },
  searchinputcontainer: {
    backgroundColor: "#BEC5CE",
  },
  searchinput: {
    color: "black",
  },
  listinput: {
    borderStyle: "solid",
    borderRadius: 3,
    width: "96%",
    height: 50,
    backgroundColor: "#BEC5CE",
    marginLeft: 8,
    fontSize: 18,
  },
  searchdropdownContainer: {
    backgroundColor: "#E2E8EE",
    padding: 10,
    position: "absolute",
    top: 282,
    zIndex: 1,
    width: "100%",
    borderColor: "gray",
    flexDirection: "row",
    // alignSelf: "center",
    // display: "flex",
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "red",
    // padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    padding: 8,
  },
  card: {
    height: 320,
    margin: 2,
    // flexDirection: "row",
    borderRadius: 5,
  },
  cardImage: {
    width: 50,
    height: 50,
    // borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "#007bff", // Blue color for the price
  },
  itemlistbox: {
    height: 500,
  },
  button: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 3,
    width: "42%",
    height: 50,
    backgroundColor: "#2F6DC3",
    margin: 10,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
});

export default CreateListScreen;
