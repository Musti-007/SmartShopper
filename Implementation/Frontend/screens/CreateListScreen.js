import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { SearchBar, Card } from "react-native-elements";
import { AntDesign } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";

function CreateListScreen({ navigation }) {
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedOption, setSelectedOption] = useState("supermarket");

  // Effect to load data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load previously saved listName and items from AsyncStorage
        const savedListName = await AsyncStorage.getItem("listName");
        const savedItems = await AsyncStorage.getItem("items");

        if (savedListName) {
          setListName(savedListName);
        }

        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      }
    };

    loadData();
  }, []);

  // Effect to save draft when listName or items change
  useEffect(() => {
    saveData();
  }, [listName, items]);

  const saveData = async () => {
    try {
      // Save listName and items to AsyncStorage
      await AsyncStorage.setItem("listName", listName);
      await AsyncStorage.setItem("items", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving data to AsyncStorage:", error);
    }
  };

  const handleFilterChange = (selectedOption) => {
    setSelectedOption(selectedOption);

    if (filteredProducts.length === 0) {
      return;
    }

    let sortedProducts = [...filteredProducts];
    if (selectedOption === "supermarket") {
      console.log("Sorting by supermarket");
      sortedProducts.sort((a, b) => a.supermarket.localeCompare(b.supermarket));
    } else if (selectedOption === "price") {
      console.log("Sorting by price");
      sortedProducts.sort((a, b) => a.p - b.p);
    } else if (selectedOption === "name") {
      console.log("Sorting by name");
      sortedProducts.sort((a, b) => a.n.localeCompare(b.n));
    }
    // console.log("Sorted products:", sortedProducts);
    setFilteredProducts(sortedProducts);
  };

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
            supermarket: section.n,
          });
        }
      }
    }

    if (text.trim() === "") {
      setFilteredProducts([]);
      return;
    }
    if (selectedOption === "supermarket") {
      console.log("Sorting by supermarket");
      filteredItems.sort((a, b) => a.supermarket.localeCompare(b.supermarket));
    } else if (selectedOption === "price") {
      console.log("Sorting by price");
      filteredItems.sort((a, b) => a.p - b.p);
    } else if (selectedOption === "name") {
      console.log("Sorting by name");
      filteredItems.sort((a, b) => a.n.localeCompare(b.n));
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
      // Get the user ID from AsyncStorage
      const userID = await AsyncStorage.getItem("userId"); // Replace 'userId' with your actual key

      // Make a POST request to create a new list using Axios
      const response = await axios.post("http://localhost:3000/lists", {
        name: listName,
        items: items,
        userId: userID,
      });

      // Assuming your API returns the created list in the response.data
      const newList = response.data;

      // Reset state after creating the list
      setListName("");
      setItems([]);
      await AsyncStorage.setItem("listName", "");
      await AsyncStorage.setItem("items", []);
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
      <View style={styles.filterContainer}>
        <RNPickerSelect
          style={{
            inputIOS: styles.selectContainer,
            inputAndroid: styles.selectContainer,
            placeholder: {}, // Add styles for the placeholder if needed
          }}
          onValueChange={(value) => handleFilterChange(value)}
          items={[
            { label: "Sort by Supermarket", value: "supermarket" },
            { label: "Sort by Price", value: "price" },
            { label: "Sort by Name", value: "name" },
          ]}
          value={selectedOption} // Set an initial value or a default value
        />
      </View>
      <TextInput
        style={styles.listinput}
        placeholder=" Enter list name"
        onChangeText={(text) => setListName(text)}
        value={listName}
      />
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
            data={filteredProducts.slice(0, 50)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleItemPress(item)}>
                <View style={styles.card}>
                  <Card.Image
                    source={{ uri: item.i }}
                    style={styles.cardImage}
                  />
                  <Text style={styles.productName}>{item.n}</Text>
                  <Text style={styles.productPrice}>€{item.p}</Text>
                </View>
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
                  <AntDesign style={styles.deleteButtonText} name="delete" />
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
    paddingRight: 8,
  },
  selectContainer: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    paddingRight: 30, // Add padding for the dropdown icon
    backgroundColor: "white",
    color: "black", // Text color
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
    display: "flex",
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
    // backgroundColor: "gray",
    height: 25,
    width: 25,
    borderRadius: 5,
    size: 24,
  },
  deleteButtonText: {
    color: "red",
    paddingTop: 2,
    textAlign: "center",
    size: 24,
  },
  card: {
    margin: 2,
    flexDirection: "row",
    borderRadius: 5,
    borderbottom: 1,
    marginBottom: 20,
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  productName: {
    fontSize: 16,
    // fontWeight: "bold",
    padding: 10,
    width: "80%",
  },
  productPrice: {
    fontSize: 14,
    color: "#007bff", // Blue color for the price
    paddingTop: 10,
    fontWeight: "bold",
  },
  itemlistbox: {
    height: 400,
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
