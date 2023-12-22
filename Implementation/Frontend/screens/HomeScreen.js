import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { SearchBar, Card } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listOfSuperMarkets, setListOfSupermarkets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bestDealProducts, setBestDealProducts] = useState([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  //login
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check if the user is logged in based on the "isLoggedIn" key in AsyncStorage
        const status = await AsyncStorage.getItem("isLoggedIn");
        setIsLoggedIn(status === "true");
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  //user location and supermarkets near the user
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      await AsyncStorage.setItem(
        "location",
        `${location.coords.latitude}, ${location.coords.longitude}`
      );

      const storedData = await AsyncStorage.getItem("supermarkets");

      if (storedData) {
        setListOfSupermarkets(JSON.parse(storedData));
        return;
      }

      const apiUrl = `https://nominatim.openstreetmap.org/search?q=supermarket+near+${location.coords.latitude}%2C+${location.coords.longitude}&limit=40&format=json`;

      try {
        const response = await axios.get(apiUrl);
        const storeData = response.data;

        const jsonData = JSON.stringify(storeData);
        await AsyncStorage.setItem("supermarkets", jsonData);
        setListOfSupermarkets(JSON.parse(jsonData));
      } catch (error) {
        console.error("Error fetching supermarket data", error);
      }
    })();
  }, []);

  //
  useEffect(() => {
    const fetchTopCheapestProducts = async () => {
      try {
        // const response = await axios.get("http://192.168.1.218:3000/api/data");
        const response = await axios.get("http://localhost:3000/api/data");
        const allProducts = [];

        // Flatten the products array from each section
        response.data.forEach((section) => {
          section.d.forEach((product) => {
            allProducts.push({
              n: product.n,
              p: product.p,
              i: section.i,
              s: product.s,
              c: section.c,
            });
          });
        });

        // Sort products by price in ascending order
        const sortedProducts = allProducts.sort((a, b) => a.p - b.p);

        // Get the top 10 cheapest products
        const topCheapestProducts = sortedProducts.slice(0, 10);
        console.log(topCheapestProducts);
        // Fetch data for the top 10 products
        const productsWithImages = await fetchData(topCheapestProducts);

        // Set the state with the products and their images
        setBestDealProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching top cheapest products:", error.message);
      }
    };

    fetchTopCheapestProducts();
  }, []);

  useEffect(() => {
    // Set up an interval to show a new product every 10 seconds
    const intervalId = setInterval(() => {
      setBestDealProducts((prevProducts) => {
        // Calculate the next index
        const nextIndex = (currentProductIndex + 1) % prevProducts.length;
        // Update the current index
        setCurrentProductIndex(nextIndex);
        // Return the current state to avoid modifying it directly
        return prevProducts;
      });
    }, 10000);

    // Clean up the interval when the component is unmounted or the effect is re-run
    return () => clearInterval(intervalId);

    // Omit bestDealProducts from the dependency array
  }, [currentProductIndex]);

  const fetchData = async (newProducts) => {
    try {
      const promises = newProducts.map(async (item) => {
        try {
          const response = await axios.get(
            // `http://192.168.1.218:3000/api/productSearch?query=${encodeURIComponent(
            `http://localhost:3000/api/productSearch?query=${encodeURIComponent(
              item.n
            )}`
          );

          const imageURL =
            response.data.productImages.length > 0
              ? response.data.productImages[
                  response.data.productImages.length - 1
                ].url
              : item.i;

          return {
            ...item,
            imageURL: imageURL,
          };
        } catch (error) {
          console.error("Error fetching data:", error.message);
          return { ...item, imageURL: item.i };
        }
      });

      const productsWithImages = await Promise.all(promises);
      return productsWithImages;
    } catch (error) {
      console.error("An error occurred:", error.message);
      return newProducts;
    }
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
    setSearchText(text);

    const searchTextLower = text.toLowerCase();
    const filteredItems = [];
    // const data = await axios.get("http://192.168.1.218:3000/api/data");
    const data = await axios.get("http://localhost:3000/api/data");

    for (const section of data.data) {
      if (
        listOfSuperMarkets.some((supermarket) =>
          checkIfSupermarketExists(supermarket, section)
        )
      ) {
        for (const product of section.d) {
          if (product.n.toLowerCase().includes(searchTextLower)) {
            filteredItems.push({
              n: product.n,
              p: product.p,
              c: section.c,
              i: section.i,
              s: product.s,
            });
          }
        }
      }
    }

    if (text.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    setFilteredProducts(filteredItems);
  };

  const handleListButtonPress = () => {
    if (isLoggedIn) {
      navigation.navigate("Lists");
    } else {
      // Handle the case when the user is not logged in
      // Example: navigation.navigate('Login');
    }
  };

  const handleCreateListButtonPress = () => {
    if (isLoggedIn) {
      navigation.navigate("CreateList");
    } else {
      // Handle the case when the user is not logged in
      // Example: navigation.navigate('Login');
    }
  };

  return (
    <LinearGradient
      colors={["#371E57", "#0E1223"]}
      style={styles.linearGradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.groupButton}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleListButtonPress}
          >
            <Text style={styles.buttonText}>List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateListButtonPress}
          >
            <Text style={styles.buttonText}>Create List</Text>
          </TouchableOpacity>
        </View>
        <SearchBar
          containerStyle={styles.searchcontainer}
          inputContainerStyle={styles.searchinputcontainer}
          inputStyle={styles.searchinput}
          placeholder="Search for an item ..."
          onChangeText={(text) => handleSearch(text)}
          onSubmitEditing={() => {
            if (searchText.trim() !== "") {
              navigation.navigate("SearchResult", {
                searchedText: searchText,
                products: filteredProducts.sort((a, b) => a.p - b.p),
              });
              setFilteredProducts([]);
              setSearchText("");
            }
          }}
          value={searchText}
        />
        {filteredProducts.length > 0 && (
          <View style={styles.searchdropdownContainer}>
            <FlatList
              data={filteredProducts.slice(0, 50).sort((a, b) => a.p - b.p)}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              renderItem={({ item }) => (
                <View style={styles.productItem}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("Item", { item });
                    }}
                  >
                    <Text style={styles.productName}>{item.n}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
        <View style={styles.bestDealsContainer}>
          <Text style={styles.bestDealTitle}>Best Deals</Text>
          {bestDealProducts.length > 0 && (
            <View style={styles.bestDealsCard}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Item", {
                    item: bestDealProducts[currentProductIndex],
                  });
                }}
              >
                <Card.Image
                  source={{
                    uri: bestDealProducts[currentProductIndex].imageURL,
                  }}
                  style={styles.bestDealImage}
                />
                <Text style={styles.bestDealName}>
                  {bestDealProducts[currentProductIndex].n}
                </Text>
                <Text style={styles.bestDealPrice}>
                  €{bestDealProducts[currentProductIndex].p.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  userName: {
    backgroundColor: "gray",
    alignSelf: "flex-end",
    marginRight: 20,
  },
  title: {
    fontSize: 40,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
    padding: 20,
    color: "white",
  },
  groupButton: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    backgroundColor: "#3B3B7F",
    height: 80,
  },
  button: {
    borderRadius: 10,
    width: "42%",
    height: 50,
    backgroundColor: "#6666FF",
    margin: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  searchcontainer: {
    backgroundColor: "#3B3B7F",
    borderWidth: 0,
  },
  searchinputcontainer: {
    backgroundColor: "#BEC5CE",
    borderRadius: 30,
    width: "95%",
    alignSelf: "center",
  },
  searchinput: {
    color: "black",
  },
  searchdropdownContainer: {
    backgroundColor: "#3B3B7F",
    borderRadius: 3,
    padding: 10,
    position: "absolute",
    top: 270,
    zIndex: 1,
    width: "100%",
    borderColor: "gray",
    display: "flex",
  },

  productItem: {
    marginBottom: 20,
    borderColor: "gray",
    padding: 2,
  },
  productName: {
    fontSize: 16,
    color: "white",
  },

  bestDealsContainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    color: "white",
    marginTop: 20,
    borderWidth: 0,
  },
  bestDealTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    alignSelf: "flex-start",
    paddingLeft: 20,
  },
  bestDealsCard: {
    width: "90%",
    overflow: "hidden",
    backgroundColor: "#271936",
    borderRadius: 10,
    borderWidth: 0,
    height: 450,
  },
  bestDealName: {
    fontSize: 18,
    marginBottom: 5,
    color: "white",
    paddingLeft: 10,
  },
  bestDealImage: {
    width: 350,
    height: 350,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
  bestDealPrice: {
    fontSize: 24,
    color: "#C87E61",
    alignSelf: "flex-end",
    padding: 10,
  },
});

export default HomeScreen;
