import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SearchBar } from "react-native-elements";

function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = async (text) => {
    setSearchText(text);

    const searchTextLower = text.toLowerCase();
    const filteredItems = [];
    const data = await axios.get("http://localhost:3000/api/data");

    for (const section of data.data) {
      for (const product of section.d) {
        if (product.n.toLowerCase().includes(searchTextLower)) {
          filteredItems.push({ n: product.n, p: product.p, c: section.n });
        }
      }
    }

    if (text.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    setFilteredProducts(filteredItems);
  };

  useFocusEffect(
    React.useCallback(() => {
      // This is called when the screen is focused
      setSearchText("");
      setFilteredProducts([]);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.groupButton}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create List</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        inputContainerStyle={styles.searchinputcontainer}
        containerStyle={styles.searchcontainer}
        inputStyle={styles.searchinput}
        placeholder="Search for an item ..."
        onChangeText={(text) => handleSearch(text)}
        onSubmitEditing={() => {
          if (searchText.trim() !== "") {
            // Navigate to SearchScreen only if the search text is not empty
            navigation.navigate("SearchResult", {
              searchedText: searchText,
              products: filteredProducts,
            });
          }
        }}
        value={searchText}
      />

      {filteredProducts.length > 0 && (
        <View style={styles.searchdropdownContainer}>
          <FlatList
            data={filteredProducts.slice(0, 100)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ItemScreen", { item });
                  }}
                  style={styles.productItem}
                >
                  <Text style={styles.productName}>{item.n}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.dealsContainer}>
        <Text>Best Deals</Text>
        <FontAwesome name="image" size={256} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Adjust the background color
  },
  title: {
    fontSize: 40,
    marginTop: 40,
    marginBottom: 40,
    alignSelf: "flex-start",
    padding: 20,
  },
  groupButton: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    flexWrap: "wrap",
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
  },
  buttonText: {
    textAlign: "center",
    color: "white",
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
  searchdropdownContainer: {
    backgroundColor: "#E2E8EE",
    borderRadius: 3,
    padding: 10,
    position: "absolute",
    top: 302,
    zIndex: 1,
    width: "100%",
    borderColor: "gray",
    alignSelf: "center",
    display: "flex",
  },
  productItem: {
    marginBottom: 10,
    borderColor: "gray",
    padding: 2,
  },
  dealsContainer: {
    marginTop: 10,
    width: "90%",
    backgroundColor: "white",
    borderRadius: 3,
    borderStyle: "solid",
    borderColor: "darkgray",
    borderWidth: 1,
    padding: 10,
    height: "40%",
    alignSelf: "center",
  },
  productName: {
    fontSize: 16,
    color: "black", //search text color
  },
});

export default HomeScreen;
