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
        inputContainerStyle={styles.searchinputcontainer}
        containerStyle={styles.searchcontainer}
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
      <View style={styles.searchresultContainer}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ItemScreen", { item });
              }}
              style={styles.cardContainer}
            >
              <Card containerStyle={styles.card}>
                <Card.Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                />
                <View style={styles.infoNamePrice}>
                  <Text style={styles.productName}>{item.n}</Text>
                  <Text style={styles.productPrice}>€{item.p}</Text>
                </View>
                <Text style={styles.supermarketName}>
                  {item.c.toUpperCase()}
                </Text>
                <Button
                  style={styles.bottomAddButton}
                  title="+ Add to list"
                  onPress={() => {
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
  searchresultContainer: {
    width: "90%",
    alignSelf: "center",
  },
  cardContainer: {
    marginBottom: 10,
    flex: 1,
    margin: 5,
  },
  card: {
    borderRadius: 5,
    height: "100%",
  },
  cardImage: {
    height: 100,
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
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
  productName: {
    fontSize: 14,
    marginTop: 10,
  },
  productPrice: {
    fontSize: 12,
    color: "#007bff",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  bottomAddButton: {
    backgroundColor: "#007bff",
    position: "absolute",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
  },
});

export default SearchResultScreen;
