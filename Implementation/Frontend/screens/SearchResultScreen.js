import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { SearchBar, Card, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";

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
      <SearchBar
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
  // container: {
  //   flex: 1,
  //   alignItems: "center",
  //   backgroundColor: "#B9C4BF", // Adjust the background color
  // },
  title: {
    fontSize: 20,
    paddingLeft: 20,
    marginBottom: 5,
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
  searchBarInput: {
    backgroundColor: "#e0e0e0",
  },
  searchresultContainer: {
    // marginTop: 10,
    width: "90%",
    alignSelf: "center",
    // flexDirection: "row",
  },
  cardContainer: {
    marginBottom: 1,
    // width: "40%",
  },
  card: {
    borderRadius: 5,
  },
  cardImage: {
    height: 200, // Set the height of the image as needed
    borderRadius: 5,
  },
  supermarketName: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 10,
    // fontWeight: "bold",
    color: "white", // Adjust the color as per your design
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
    backgroundColor: "#007bff", // Adjust the color as per your design
  },
});

export default SearchResultScreen;
