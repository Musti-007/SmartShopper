import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import { SearchBar, Card, Button } from "react-native-elements";

const SearchResultScreen = ({ route, navigation }) => {
  const { searchedText, products } = route.params;
  const [searchText, setSearchText] = useState(searchedText);
  const [filteredProducts, setFilteredProducts] = useState(products);

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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
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
      <View style={styles.searchresultContainer}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ItemScreen", { item });
              }}
              style={styles.cardContainer}
            >
              <Card containerStyle={styles.card}>
                {/* Top part of the card for the picture */}
                <Card.Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                />
                {/* Top left on the picture: Name of the supermarket */}
                <Text style={styles.supermarketName}>
                  {item.c.toUpperCase()}
                </Text>
                <View style={styles.infoNamePrice}>
                  {/* Below the picture to the left: Name of the item */}
                  <Text style={styles.productName}>{item.n}</Text>
                  {/* Bottom of the card: Price and Add to List button */}
                  <View style={styles.bottomContainer}>
                    <Text style={styles.productPrice}>€{item.p}</Text>
                  </View>
                </View>
                <Button
                  style={styles.bottomAddButton}
                  title="+ Add to list"
                  onPress={() => {
                    // Logic for adding to the list
                    console.log("Add to list clicked");
                  }}
                  buttonStyle={styles.addButton}
                />
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#B9C4BF", // Adjust the background color
  },
  searchbar: {
    // backgroundColor: "#B9C4BF",
  },
  title: {
    fontSize: 20,
    paddingLeft: 20,
    marginBottom: 5,
    marginTop: 5,
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
    backgroundColor: "#E2E8EE",
    border: 0,
    color: "black",
  },
  searchinputcontainer: {
    backgroundColor: "#BEC5CE",
  },
  searchinput: {
    color: "black",
  },
  searchBarInput: {
    backgroundColor: "#e0e0e0",
  },
  searchresultContainer: {
    width: "90%",
    alignSelf: "center",
  },
  cardContainer: {
    marginBottom: 1,
  },
  card: {
    borderRadius: 5,
  },
  cardImage: {
    height: 200, // height of the image
    borderRadius: 5,
  },
  supermarketName: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 10,
    color: "white",
  },
  infoNamePrice: {
    flexDirection: "row",
  },
  productName: {
    fontSize: 14,
    marginTop: 10,
    width: "88%",
  },
  productPrice: {
    marginTop: 10,
    fontSize: 12,
    color: "#007bff",
    alignSelf: "flex-end",
  },
  bottomAddButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
  },
});

export default SearchResultScreen;
