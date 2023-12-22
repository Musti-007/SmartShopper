import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ItemScreen = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();
  const [selectedList, setSelectedList] = useState(null);
  const [lists, setLists] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

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
          const productImages = response.data.productImages;

          console.log(`Fetched images for product ${item.n}:`, productImages);

          return {
            ...item,
            imageURL: productImages[productImages.length - 1].url,
          };
        } catch (error) {
          console.error("Error fetching data:", error.message);
          return { ...item, imageURL: item.i };
        }
      });

      const updatedProducts = await Promise.all(promises);

      setFilteredProducts(updatedProducts);
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  useEffect(() => {
    let sortedProducts = [...filteredProducts];

    setFilteredProducts(sortedProducts.slice(0, 10));
    fetchData(sortedProducts.slice(0, 10));
  }, []);

  useEffect(() => {
    // Fetch lists from the server when the component mounts
    fetchLists();
  }, []);
  const fetchLists = async () => {
    try {
      // Get the user ID from AsyncStorage
      const userID = await AsyncStorage.getItem("userId"); // Replace 'userId' with your actual key

      // Fetch lists from the server using axios
      const response = await axios.get(
        // `http://192.168.1.218:3000/lists/${userID}`
        `http://localhost:3000/lists/${userID}`
      );
      //   console.log(response.data);
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching lists:", error.message);
    }
  };

  const handleButtonPress = async (item) => {
    console.log(item);
    // console.log(selectedList);
    try {
      // Your API endpoint and data
      // const endpoint = `http://192.168.1.218:3000/products/${selectedList.ListID}`;
      const endpoint = `http://localhost:3000/products/${selectedList.ListID}`;
      const data = {
        productName: item.n,
        price: item.p,
        category: item.s,
        storeName: item.c,
      };
      console.log("Request Data:", data);
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <Card containerStyle={styles.card}>
          {/* Top part of the card for the picture */}
          <Card.Image
            source={{ uri: item.imageURL }}
            style={styles.cardImage}
          />
          {/* Top left on the picture: Name of the supermarket */}
          <Text style={styles.supermarketName}>{item.c}</Text>
          <View style={styles.infoNamePrice}>
            {/* Below the picture to the left: Name of the item */}
            <Text style={styles.productName}>{item.n}</Text>
            {/* Bottom of the card: Price and Add to List button */}
            <View style={styles.bottomContainer}>
              <Text style={styles.productPrice}>€{item.p.toFixed(2)}</Text>
            </View>
          </View>
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
                marginTop: 50,
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
      </View>
    </LinearGradient>
  );
};

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
  container: {
    flex: 1,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#007bff",
  },
  card: {
    width: "90%", // Set a fixed width for the card
    overflow: "hidden", // Ensure the image stays within the card boundaries
    marginTop: 60,
    backgroundColor: "#271936",
    borderRadius: 15,
    borderWidth: 0,
  },
  cardImage: {
    height: 450,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  supermarketName: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 10,
    color: "white",
    backgroundColor: "gray",
    borderRadius: 5,
    padding: 2,
  },
  infoNamePrice: {
    padding: 10,
    flexDirection: "row",
  },
  productName: {
    fontSize: 16,
    width: "88%",
    color: "white",
    paddingTop: 20,
    alignSelf: "flex-start",
  },
  productPrice: {
    fontSize: 18,
    color: "#C87E61", // Blue color for the price
    paddingTop: 10,
    fontWeight: "bold",
    // width: "12%",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  bottomAddButton: {
    borderRadius: 10,
    height: 50,
    backgroundColor: "#6666FF",
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
});

export default ItemScreen;
