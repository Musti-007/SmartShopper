import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Share,
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
  const [userEmail, setUserEmail] = useState(""); // Added state for userEmail

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user location and email from AsyncStorage
        const location = await AsyncStorage.getItem("location");
        const email = await AsyncStorage.getItem("userEmail");

        if (location) {
          setUserLocation(location);
        }

        if (email) {
          setUserEmail(email);
        } else {
          // Dummy email for testing
          setUserEmail("test@example.com");
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Fetch data only if user location is available
    if (userLocation) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            // `http://192.168.1.218:3000/combinedData/${list.ListID}`
            `http://localhost:3000/combinedData/${list.ListID}`
          );
          const itemsWithDistances = await Promise.all(
            response.data.map(async (item) => {
              try {
                const distance = await calculateRouteDistance(
                  userLocation,
                  item.Location
                );
                return { ...item, distance };
              } catch (error) {
                console.error(
                  "Error calculating distance for item:",
                  item,
                  error.message
                );
                return { ...item, distance: "Error" };
              }
            })
          );
          setCombinedData(itemsWithDistances);
        } catch (error) {
          console.error("Error fetching combined data:", error);
        }
      };

      fetchData();
    }
  }, [userLocation, list.ListID]);

  async function calculateRouteDistance(sourceLocation, destinationLocation) {
    const osrmEndpoint = "http://router.project-osrm.org/route/v1/driving/";
    const coordinates1 = sourceLocation.split(",");
    const coordinates2 = destinationLocation.split(",");
    const url = `${osrmEndpoint}${coordinates1[1].trim()},${
      coordinates1[0]
    };${coordinates2[1].trim()},${coordinates2[0]}?overview=false`;

    try {
      const response = await axios.get(url);

      if (response.data.code !== "Ok") {
        throw new Error("No route found.");
      }

      const distanceInMeters = response.data.routes[0].distance;

      if (distanceInMeters < 1000) {
        return `${distanceInMeters.toFixed(2)} m`;
      } else {
        const distanceInKilometers = distanceInMeters / 1000;
        return `${distanceInKilometers.toFixed(2)} km`;
      }
    } catch (error) {
      console.error("Error calculating route distance:", error.message);
      throw error;
    }
  }

  const calculateTotal = (data) => {
    const total = data.reduce((acc, item) => acc + item.Price, 0);
    return total.toFixed(2); // Assuming Price is a floating-point number
  };

  const saveUserEmail = async (email) => {
    try {
      await AsyncStorage.setItem("userEmail", email);
    } catch (error) {
      console.error("Error saving user email:", error);
    }
  };

  const handleShareListPress = async () => {
    try {
      // Check if the user's email address is available
      console.log("User Email:", userEmail);

      if (userEmail) {
        const shareOptions = {
          message: generateShareMessage(combinedData, userEmail),
          url: "", // Add URL if needed
        };

        const result = await Share.share(shareOptions);
        console.log(result);
      } else {
        console.error("User email address is null or undefined");
      }
    } catch (error) {
      console.error("Error sharing list:", error.message);
    }
  };

  const generateShareMessage = (data, userEmail) => {
    const items = data.map(
      (item) => `${item.ProductName}: €${item.Price.toFixed(2)}`
    );
    const total = `Total: €${calculateTotal(data)}`;

    return `User Email: ${userEmail}\n\n${items.join("\n")}\n\n${total}`;
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
                    <Text style={styles.productDistance}>{item.distance}</Text>
                  </View>
                </View>
                <Text style={styles.productPrice}>
                  €{item.Price.toFixed(2)}
                </Text>
              </View>
            )}
          />
        </View>
        <View style={styles.totalPricebox}>
          <Text style={styles.totalText}>Total: </Text>
          <Text style={styles.totalPrice}>€{calculateTotal(combinedData)}</Text>
        </View>
        <View style={styles.groupbutton}>
          <TouchableOpacity
            style={styles.sharelistbutton}
            onPress={() =>
              navigation.navigate("GetDirection", { combinedData })
            }
          >
            <Text style={styles.buttonText}>Get Direction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sharelistbutton}
            onPress={handleShareListPress}
          >
            <Text style={styles.buttonText}>Share List</Text>
          </TouchableOpacity>
        </View>
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
    height: 520,
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
    width: 250,
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
  totalPricebox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  totalText: {
    alignSelf: "flex-start",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 20,
  },
  totalPrice: {
    alignSelf: "flex-end",
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    paddingRight: 10,
  },
  groupbutton: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    backgroundColor: "#3B3B7F",
    height: 80,
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
