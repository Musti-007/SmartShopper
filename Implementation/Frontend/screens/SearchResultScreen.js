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
import Select from "react-select";

const SearchResultScreen = ({ route, navigation }) => {
  const { searchedText, products } = route.params;
  const [searchText, setSearchText] = useState(searchedText);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedFilter, setSelectedFilter] = useState("supermarket");

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

  const handleFilterChange = (selectedOption) => {
    setSelectedFilter(selectedOption.value);
    // Logic to sort the data based on the selected filter
    let sortedProducts = [...filteredProducts];
    if (selectedOption.value === "supermarket") {
      sortedProducts.sort((a, b) => a.c.localeCompare(b.c));
    } else if (selectedOption.value === "price") {
      sortedProducts.sort((a, b) => a.p - b.p);
    } else if (selectedOption.value === "name") {
      sortedProducts.sort((a, b) => a.n.localeCompare(b.n));
    }
    setFilteredProducts(sortedProducts);
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
      <View style={styles.filterContainer}>
        <Select
          options={[
            { value: "supermarket", label: "Sort by Supermarket" },
            { value: "price", label: "Sort by Price" },
            { value: "name", label: "Sort by Name" },
          ]}
          value={{ value: selectedFilter, label: `Sort by ${selectedFilter}` }}
          onChange={handleFilterChange}
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
                <Card.Image source={{ uri: item.i }} style={styles.cardImage} />

                <View style={styles.namepricebox}>
                  <Text style={styles.productName}>{item.n}</Text>
                  <Text style={styles.productPrice}>€{item.p}</Text>
                </View>

                <Text style={styles.supermarketName}>{item.c}</Text>
                <Button
                  style={styles.bottomAddButton}
                  title={"+ Add to list"}
                  onPress={() => {
                    console.log("Add to list clicked");
                  }}
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardContainer: {
    marginBottom: 2,
    flex: 1,
    // margin: 5,
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 5,
    height: 320,
    margin: 2,
    flexDirection: "column",
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
    height: 100,
  },
  productName: {
    fontSize: 14,
    marginTop: 10,
  },
  productPrice: {
    fontSize: 12,
    color: "#007bff",
  },
  bottomAddButton: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: "#2F6DC3",
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 10,
    zIndex: 1,
    marginRight: 22,
  },
  unknown: { marginHorizontal: 10 },
  dropdown: { backgroundColor: "#fafafa" },
});

export default SearchResultScreen;
