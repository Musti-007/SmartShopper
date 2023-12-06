import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

function ListDetailsScreen({ route }) {
  const { list } = route.params;
  const navigation = useNavigation();

  const [userLocation, setUserLocation] = useState("");
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/combinedData/${list.ListID}`
        );
        setCombinedData(response.data);
      } catch (error) {
        console.error("Error fetching combined data:", error);
      }
    };

    fetchData();
  }, [list.ListID]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load previously saved listName and items from AsyncStorage
        const userLocation = await AsyncStorage.getItem("location");

        if (userLocation) {
          setUserLocation(userLocation);
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      }
    };

    loadData();
  }, []);

  function calculateHaversineDistance(location) {
    const coordinates1 = userLocation.split(",");
    const lat1 = parseFloat(coordinates1[0]);
    const lon1 = parseFloat(coordinates1[1]);

    const coordinates2 = location.split(",");
    const lat2 = parseFloat(coordinates2[0]);
    const lon2 = parseFloat(coordinates2[1]);

    // Radius of the Earth in kilometers
    const R = 6371;

    // Convert latitude and longitude from degrees to radians
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLon1 = (lon1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const radLon2 = (lon2 * Math.PI) / 180;

    // Calculate differences in coordinates
    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;

    // Haversine formula
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) *
        Math.cos(radLat2) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    const distance = R * c;

    return distance.toFixed(2);
  }

  const calculateTotal = (data) => {
    const total = data.reduce((acc, item) => acc + item.Price, 0);
    return total.toFixed(2); // Assuming Price is a floating-point number
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
        <Text style={styles.title}>List {list.ListName}</Text>
        <View style={styles.itemlistbox}>
          <FlatList
            data={combinedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.productInfo}>
                  <AntDesign
                    name="shoppingcart"
                    size={24}
                    color="#007bff"
                    style={styles.icon}
                  />
                  <View style={styles.productTextContainer}>
                    <Text style={styles.productName}>{item.ProductName}</Text>
                    <Text style={styles.productDistance}>
                      Distance: {calculateHaversineDistance(item.Location)} KM
                    </Text>
                  </View>
                </View>
                <Text style={styles.productPrice}>€{item.Price}</Text>
              </View>
            )}
          />
        </View>
        <TouchableOpacity
          style={styles.sharelistbutton}
          onPress={() => "" /* Add your logic for sharing */}
        >
          <Text style={styles.buttonText}>Share List</Text>
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
  itemlistbox: {
    height: 550,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  productTextContainer: {
    flexDirection: "column",
  },
  productName: {
    fontSize: 16,
    width: "auto",
    color: "white",
  },
  productDistance: {
    fontSize: 12,
    color: "gray",
    paddingTop: 10,
  },
  productPrice: {
    fontSize: 16,
    color: "#C87E61",
    fontWeight: "bold",
  },
  sharelistbutton: {
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

export default ListDetailsScreen;
