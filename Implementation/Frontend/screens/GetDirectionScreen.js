import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const GetDirectionScreen = ({ route }) => {
  const { combinedData } = route.params;
  const navigation = useNavigation();
  const mapViewRef = useRef(null);

  // Set initial region based on the user's location stored in AsyncStorage
  const [initialRegion, setInitialRegion] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);

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

        setUserLocation({ latitude, longitude });

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

  // Function to handle the "Locate Me" button press
  const handleLocateMe = () => {
    if (mapViewRef.current && userLocation) {
      mapViewRef.current.animateToRegion(userLocation, 1000);
      setCurrentRegion(userLocation);
    }
  };

  // Function to handle region changes
  const handleRegionChangeComplete = (region) => {
    setCurrentRegion(region);
  };

  return (
    <LinearGradient
      colors={["#371E57", "#0E1223"]}
      style={styles.linearGradient}
    >
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Direction</Text>

        <MapView
          style={styles.map}
          ref={mapViewRef}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onRegionChangeComplete={handleRegionChangeComplete}
          userLocationAnnotationTitle="Your Location"
        >
          <TouchableOpacity
            onPress={handleLocateMe}
            style={styles.locateButton}
          >
            <MaterialIcons name="my-location" size={24} color="black" />
          </TouchableOpacity>
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
  title: {
    fontSize: 40,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
    padding: 20,
    color: "white",
  },

  map: {
    minHeight: "80%",
    flex: 1,
    borderRadius: 10,
  },
  locateButton: {
    top: 10,
    left: 10,
    zIndex: 1,
    alignSelf: "flex-end",
    paddingRight: 20,
  },
});

export default GetDirectionScreen;
