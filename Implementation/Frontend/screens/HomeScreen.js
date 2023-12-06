import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SearchBar } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listOfSuperMarkets, setListOfSupermarkets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state to track login status

  const handleSearch = async (text) => {
    setSearchText(text);

    const searchTextLower = text.toLowerCase();
    const filteredItems = [];
    const data = await axios.get("http://192.168.1.218:3000/api/data");
    // console.log("Data result: ", data.data);

    for (const section of data.data) {
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

    if (text.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    setFilteredProducts(filteredItems);
  };

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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({}); // Set user location with lat long

      await AsyncStorage.setItem(
        "location",
        `${location.coords.latitude}, ${location.coords.longitude}`
      ); // Check if data is already stored in AsyncStorage

      const storedData = await AsyncStorage.getItem("supermarkets");

      if (storedData) {
        // Data is already stored, no need to make the request again
        console.log("Data already exists:", storedData);
        setListOfSupermarkets(storedData);
        return;
      } // Fetch supermarket data using OpenStreetMap Nominatim API with axios

      const apiUrl = `https://nominatim.openstreetmap.org/search?q=supermarket+near+${location.coords.latitude}%2C+${location.coords.longitude}&limit=40&format=json`;

      try {
        const response = await axios.get(apiUrl);
        const storeData = response.data; // Convert the object to a JSON string before storing

        const jsonData = JSON.stringify(storeData);
        console.log("Setting new data");
        await AsyncStorage.setItem("supermarkets", jsonData);
        setListOfSupermarkets(jsonData);
      } catch (error) {
        console.error("Error fetching supermarket data", error);
      }
    })();
  }, []);

  const handleListButtonPress = () => {
    if (isLoggedIn) {
      navigation.navigate("Lists"); // Navigate to the ListsScreen
    } else {
      // Handle the case when the user is not logged in (e.g., show a login screen)
      // Example: navigation.navigate('Login');
    }
  };

  const handleCreateListButtonPress = () => {
    if (isLoggedIn) {
      navigation.navigate("CreateList"); // Navigate to the CreateListScreen
    } else {
      // Handle the case when the user is not logged in (e.g., show a login screen)
      // Example: navigation.navigate('Login');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // This is called when the screen is focused
      setSearchText("");
      setFilteredProducts([]);
    }, [])
  );

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
              // Navigate to SearchScreen only if the search text is not empty
              navigation.navigate("SearchResult", {
                searchedText: searchText,
                products: filteredProducts.sort((a, b) => a.p - b.p),
              });
            }
          }}
          value={searchText}
        />

        {filteredProducts.length > 0 && (
          <View style={styles.searchdropdownContainer}>
            <FlatList
              data={filteredProducts.slice(0, 100).sort((a, b) => a.p - b.p)}
              keyExtractor={(item, index) => index.toString()}
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

        <View style={styles.dealsContainer}>
          <Text style={styles.dealconttext}>Best Deals</Text>
          {/* <FontAwesome name="image" size={256} color="black" /> */}
          <Image
            source={{
              with: 200,
              height: 300,
              uri: "https://picsum.photos/200/300",
            }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
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
  dealsContainer: {
    marginTop: 20,
    width: "90%",
    backgroundColor: "#271936",
    borderRadius: 20,
    borderColor: "darkgray",
    padding: 10,
    height: "55%",
    alignSelf: "center",
  },
  dealconttext: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
  productName: {
    fontSize: 16,
    color: "white", //search text color
  },
});

export default HomeScreen;
