import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { SearchBar, Card } from "react-native-elements";
import { AntDesign } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

function CreateListScreen({ navigation }) {
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedOption, setSelectedOption] = useState("price");
  const [supermarkets, setSupermarkets] = useState([]);

  // Effect to load data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load previously saved listName and items from AsyncStorage
        const savedListName = await AsyncStorage.getItem("listName");
        const savedItems = await AsyncStorage.getItem("items");
        const savedLocations = await AsyncStorage.getItem("supermarkets");

        if (savedListName) {
          setListName(savedListName);
        }

        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }

        if (savedLocations) {
          setSupermarkets(JSON.parse(savedLocations));
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

  const checkIfSupermarketExists = (supermarket, section) => {
    if (
      supermarket.name.toLowerCase().includes("Albert Heijn".toLowerCase()) &&
      section.c.toLowerCase() === "ah"
    ) {
      return true;
    }

    return supermarket.name.toLowerCase().includes(section.c.toLowerCase());
  };

  const handleSearch = async (text) => {
    setItemName(text);

    const searchTextLower = text.toLowerCase();
    const filteredItems = [];
    const data = await axios.get("http://192.168.1.218:3000/api/data");
    // const data = await axios.get("http://localhost:3000/api/data");

    for (const section of data.data) {
      if (
        supermarkets.some((supermarket) =>
          checkIfSupermarketExists(supermarket, section)
        )
      ) {
        for (const product of section.d) {
          if (product.n.toLowerCase().includes(searchTextLower)) {
            filteredItems.push({
              n: product.n,
              s: product.s,
              p: product.p,
              i: section.i,
              supermarket: section.c,
            });
          }
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
    const foundSupermarket = supermarkets.find((supermarket) => {
      if (
        (item.supermarket.toLowerCase() === "ah" &&
          supermarket.name.toLowerCase() === "albert heijn") ||
        (item.supermarket.toLowerCase() === "janlinders" &&
          supermarket.name.toLowerCase() === "jan linders")
      ) {
        return supermarket.name;
      } else if (
        item.supermarket.toLowerCase() === supermarket.name.toLowerCase()
      ) {
        return supermarket.name;
      }
    });

    if (foundSupermarket) {
      setItems([
        ...items,
        {
          name: item.n,
          price: item.p,
          store: item.supermarket,
          description: item.s,
          location: `${foundSupermarket.lat}, ${foundSupermarket.lon}`,
        },
      ]);
    }

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
      const response = await axios.post("http://192.168.1.218:3000/lists", {
        //   const response = await axios.post("http://localhost:3000/lists", {
        name: listName,
        items: items,
        userId: userID,
      });

      // Assuming your API returns the created list in the response.data
      const newList = response.data;

      // Reset state after creating the list
      setListName("");
      setItems([]);
      await AsyncStorage.removeItem("listName");
      await AsyncStorage.removeItem("items");
    } catch (error) {
      console.error("Error creating list:", error.message);
      // Handle the error in a way that makes sense for your application
    }
    Alert.alert(`You have successfully created ${listName}.`);
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

        <Text style={styles.title}>Create Grocery List</Text>
        <View style={styles.filterContainer}>
          <RNPickerSelect
            style={{
              inputIOS: {
                color: "white",
                paddingHorizontal: 10,
                height: 30,
                backgroundColor: "#6666F6",
                borderRadius: 10,
              },
              placeholder: {
                color: "white",
              },
              inputAndroid: {
                color: "white",
                paddingHorizontal: 10,
                backgroundColor: "red",
                borderRadius: 5,
              },
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
          placeholderTextColor="gray"
          onChangeText={(text) => setListName(text)}
          value={listName}
        />
        <SearchBar
          inputContainerStyle={styles.searchinputcontainer}
          containerStyle={styles.searchcontainer}
          inputStyle={styles.searchinput}
          placeholder="Add item"
          placeholderTextColor="gray"
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
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.n}</Text>
                      <Text style={styles.description}>{item.s}</Text>
                    </View>
                    <Text style={styles.productPrice}>
                      €{item.p.toFixed(2)}
                    </Text>
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
        <TouchableOpacity
          style={styles.createlistbutton}
          onPress={handleCreateList}
          disabled={!listName.trim()}
        >
          <Text style={styles.buttonText}>Create List</Text>
        </TouchableOpacity>
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
  searchcontainer: {
    backgroundColor: "#3B3B7F",
    border: 0,
  },
  searchinputcontainer: {
    backgroundColor: "#BEC5CE",
    borderRadius: 30,
  },
  searchinput: {
    color: "black",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
    paddingRight: 2,
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
    width: "100%",
    height: 50,
    backgroundColor: "#3B3B7F",
    fontSize: 18,
    paddingLeft: 10,
    color: "white",
  },
  searchdropdownContainer: {
    backgroundColor: "#3B3B7F",
    padding: 10,
    position: "absolute",
    top: 275,
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
    color: "white",
  },
  deleteButton: {
    textAlign: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "red",
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    backgroundColor: "#3B3B7F",
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    // alignSelf: "flex-start",
  },
  productName: {
    fontSize: 16,
    paddingLeft: 10,
    width: "95%",
    color: "white",
  },
  productPrice: {
    fontSize: 14,
    color: "#C87E61", // Blue color for the price
    paddingTop: 10,
    fontWeight: "bold",
    width: "12%",
  },
  description: {
    fontSize: 12,
    paddingLeft: 10,
    color: "grey",
    paddingTop: 10,
  },
  itemlistbox: {
    height: 300,
  },
  createlistbutton: {
    borderRadius: 10,
    width: "42%",
    height: 50,
    backgroundColor: "#6666F6",
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
