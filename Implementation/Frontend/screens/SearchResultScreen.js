import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { SearchBar, Card } from "react-native-elements";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const SearchResultScreen = ({ route, navigation }) => {
  const { searchedText, products } = route.params;
  const [searchText, setSearchText] = useState(searchedText);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedOption, setSelectedOption] = useState("price");
  const [selectedList, setSelectedList] = useState(null);
  const [lists, setLists] = useState([]);

  const handleFilterChange = (selectedOption) => {
    setSelectedOption(selectedOption);

    if (filteredProducts.length === 0) {
      return;
    }

    let sortedProducts = [...filteredProducts];
    if (selectedOption === "supermarket") {
      console.log("Sorting by supermarket");
      sortedProducts.sort((a, b) => a.c.localeCompare(b.c));
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
    setSearchText(text);

    const searchTextLower = text.toLowerCase();
    const filteredItems = [];
    const data = await axios.get("http://localhost:3000/api/data");

    for (const section of data.data) {
      for (const product of section.d) {
        if (product.n.toLowerCase().includes(searchTextLower)) {
          filteredItems.push({
            n: product.n,
            p: product.p,
            c: section.c,
            i: section.i,
            supermarket: section.n,
            s: product.s,
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
  useEffect(() => {
    // Fetch lists from the server when the component mounts
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      // Get the user ID from AsyncStorage
      const userID = await AsyncStorage.getItem("userId"); // Replace 'userId' with your actual key

      // Fetch lists from the server using axios
      const response = await axios.get(`http://localhost:3000/lists/${userID}`);
      console.log(response.data);
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching lists:", error.message);
    }
  };

  const handleButtonPress = async (item) => {
    console.log(item);
    console.log(selectedList);
    try {
      // Your API endpoint and data
      const endpoint = `http://localhost:3000/products/${selectedList.ListID}`;
      const data = {
        productName: item.n,
        price: item.p,
        category: item.s,
        storeName: item.c,
      };

      // Make a POST request to add a new entry
      const response = await axios.post(endpoint, data);

      // Handle the response from the server
      console.log("Response:", response.data);

      // Perform any other actions based on the response
    } catch (error) {
      console.error("Error:", error);
      // Handle errors (e.g., show an error message to the user)
    }
  };

  return (
    <LinearGradient
      colors={["#371E57", "#0E1223"]}
      style={styles.linearGradient}
    >
      <View style={styles.container}>
        <SearchBar
          containerStyle={styles.searchcontainer}
          inputContainerStyle={styles.searchinputcontainer}
          inputStyle={styles.searchinput}
          placeholder="Search for an item ..."
          onChangeText={(text) => handleSearch(text)}
          onSubmitEditing={() => {
            if (searchText.trim() !== "") {
              navigation.navigate("SearchResult", {
                searchText,
                filteredProducts,
              });
            }
          }}
          value={searchText}
        />
        <Text style={styles.title}>
          Search Results for <Text style={styles.boldText}>"{searchText}"</Text>
        </Text>
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
        <View style={styles.searchresultContainer}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => {
                  navigation.navigate("Item", { item });
                }}
              >
                <Card containerStyle={styles.card}>
                  <Card.Image
                    source={{ uri: item.i }}
                    style={styles.cardImage}
                  />

                  <View style={styles.namepricebox}>
                    <Text style={styles.productName}>{item.n}</Text>
                    <Text style={styles.productPrice}>€{item.p}</Text>
                  </View>

                  <Text style={styles.supermarketName}>{item.c}</Text>
                  <RNPickerSelect
                    items={lists.map((list) => ({
                      label: list.ListName,
                      value: list,
                    }))}
                    placeholder={{
                      label: "Select a list",
                    }}
                    onValueChange={(value) => setSelectedList(value)}
                    value={selectedList}
                    style={{
                      inputIOS: {
                        fontSize: 14, // Adjust the font size
                        paddingVertical: 12, // Adjust the vertical padding
                        paddingHorizontal: 10, // Adjust the horizontal padding
                        borderColor: "gray",
                        color: "white",
                      },
                      inputAndroid: {
                        fontSize: 16, // Adjust the font size
                        paddingHorizontal: 10, // Adjust the horizontal padding
                        paddingVertical: 8, // Adjust the vertical padding
                        borderWidth: 0.5,
                        borderColor: "gray",
                        borderRadius: 8,
                        backgroundColor: "red",
                        color: "black",
                      },
                    }}
                  />
                  <TouchableOpacity
                    style={styles.bottomAddButton}
                    onPress={() => handleButtonPress(item)}
                  >
                    <Text style={styles.buttonText}>+ Add to list</Text>
                  </TouchableOpacity>
                </Card>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
    paddingLeft: 20,
    color: "white",
  },
  boldText: {
    fontWeight: "bold",
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchcontainer: {
    backgroundColor: "#3B3B7F",
    borderWidth: 0,
  },
  searchinputcontainer: {
    backgroundColor: "#BEC5CE",
    borderRadius: 30,
  },
  searchinput: {
    color: "black",
  },
  searchresultContainer: {
    width: "90%",
    alignSelf: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    height: 40,
  },
  filterdropdown: {
    justifyContent: "center",
    marginBottom: 10,
    height: 40,
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
  cardContainer: {
    marginBottom: 2,
    flex: 1,
    // margin: 5,
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 5,
    height: 350,
    margin: 2,
    flexDirection: "column",
    backgroundColor: "#271936",
    borderWidth: 0,
  },
  cardImage: {
    height: 150,
    borderRadius: 5,
  },
  supermarketName: {
    position: "absolute",
    top: 0,
    left: 0,
    fontSize: 10,
    color: "black",
    backgroundColor: "#E2E8EE",
    borderRadius: 3,
    padding: 2,
  },
  namepricebox: {
    height: 70,
    flexDirection: "row",
  },
  productName: {
    fontSize: 14,
    marginTop: 10,
    alignSelf: "flex-start",
    width: "80%",
    color: "white",
  },
  productPrice: {
    fontSize: 12,
    color: "#007bff",
    alignSelf: "flex-end",
    justifyContent: "space-between",
  },
  bottomAddButton: {
    borderRadius: 10,
    height: 50,
    backgroundColor: "#6666FF",
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 10,
    zIndex: 1,
    marginRight: 22,
  },
});

export default SearchResultScreen;
