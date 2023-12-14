import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GetDirectionScreen = ({ route }) => {
  const { combinedData } = route.params;
  const mapViewRef = useRef(null);

  // Set initial region based on the user's location stored in AsyncStorage
  const [initialRegion, setInitialRegion] = useState({});

  useEffect(() => {
    const fetchUserLocation = async () => {
      const location = await getUserLocation();
      setInitialRegion(location);

      // Animate the map to the user's location
      if (mapViewRef.current && location) {
        mapViewRef.current.animateToRegion(location, 1000); // Adjust duration as needed
      }
    };

    fetchUserLocation();
  }, []); // Run once when the component mounts

  // Function to get the user's location from AsyncStorage
  const getUserLocation = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem("location");
      console.log(storedLocation);
      if (storedLocation) {
        const [latStr, lonStr] = storedLocation.split(", ");

        // Convert the string values to numbers
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lonStr);

        return {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }
    } catch (error) {
      console.error("Error retrieving user location:", error);
    }

    // Return null if there's an error or no stored location
    return null;
  };

  return (
    <View>
      <Text style={styles.title}>Direction</Text>
      <MapView
        style={styles.map}
        ref={mapViewRef}
        initialRegion={initialRegion}
      >
        {combinedData.map((item, index) => {
          // Split the "lat, lon" string from the Location key
          const [latStr, lonStr] = item.Location.split(", ");

          // Convert the string values to numbers
          const latitude = parseFloat(latStr);
          const longitude = parseFloat(lonStr);

          return (
            <Marker
              key={index}
              coordinate={{ latitude, longitude }}
              title={item.StoreName}
            />
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 80,
  },
  map: {
    minHeight: 700,
    flex: 1,
  },
});

export default GetDirectionScreen;
