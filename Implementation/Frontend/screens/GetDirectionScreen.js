import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";

const GetDirectionScreen = ({ route, navigation }) => {
  const { combinedData } = route.params;
  const mapViewRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState({});
  const [routes, setRoutes] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchUserLocation = async () => {
      const location = await getUserLocation();

      setUserLocation(location);
      setInitialRegion(location);

      if (mapViewRef.current && location) {
        mapViewRef.current.animateToRegion(location, 1000);
      }
    };

    fetchUserLocation();
  }, []);

  const handleLocateMe = () => {
    if (mapViewRef.current && userLocation) {
      mapViewRef.current.animateToRegion(userLocation, 1000);
    }
  };

  const getUserLocation = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem("location");
      if (storedLocation) {
        const [latStr, lonStr] = storedLocation.split(",");

        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lonStr);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          return {
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
        } else {
          console.error("Invalid latitude or longitude:", storedLocation);
        }
      }
    } catch (error) {
      console.error("Error retrieving user location:", error);
    }

    return null;
  };

  const getRoutePolyline = async () => {
    try {
      const routesPromises = combinedData.map(async (item) => {
        const waypoints = [
          `${initialRegion.longitude},${initialRegion.latitude}`,
          `${item.Location.split(",")[1].trim()},${item.Location.split(
            ","
          )[0].trim()}`,
        ];

        const response = await axios.get(
          `http://router.project-osrm.org/route/v1/driving/${waypoints.join(
            ";"
          )}?overview=full&steps=true&geometries=geojson`
        );

        if (response.data.code === "Ok") {
          const duration = response.data.routes[0].duration / 60; // Convert seconds to minutes
          const distance = response.data.routes[0].distance / 1000; // Convert meters to kilometers

          console.log(
            `Time from user to ${item.StoreName}: ${duration.toFixed(
              2
            )} minutes, Distance: ${distance.toFixed(2)} km`
          );

          return {
            coordinates: response.data.routes[0].geometry.coordinates.map(
              (coordinate) => ({
                latitude: coordinate[1],
                longitude: coordinate[0],
              })
            ),
            duration: duration.toFixed(2),
            distance: distance.toFixed(2),
          };
        } else {
          console.error("Error fetching route:", response.data.message);
          return null;
        }
      });

      const routes = await Promise.all(routesPromises);

      // Filter out any routes that had an error
      const validRoutes = routes.filter((route) => route !== null);

      setRoutes(validRoutes);
    } catch (error) {
      console.error("Error fetching routes:", error.message);
    }
  };

  useEffect(() => {
    if (initialRegion.latitude && combinedData.length > 0) {
      setIsReady(true); // Set isReady to true when both initialRegion and combinedData are available
    }
  }, [initialRegion, combinedData]);

  useEffect(() => {
    if (isReady) {
      getRoutePolyline();
    }
  }, [isReady]);

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
          initialRegion={userLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
          userLocationAnnotationTitle="Your Location"
        >
          <TouchableOpacity onPress={handleLocateMe}>
            <MaterialIcons
              style={styles.locateButton}
              name="my-location"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          {routes.map((route, index) => (
            <Polyline
              key={index}
              coordinates={route.coordinates}
              strokeWidth={3}
              strokeColor="blue"
            />
          ))}

          {combinedData.map((item, index) => {
            const route = routes[index]; // Find the corresponding route
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(item.Location.split(",")[0]),
                  longitude: parseFloat(item.Location.split(",")[1]),
                }}
                title={item.StoreName}
              >
                <Callout>
                  <View>
                    <Text>{item.StoreName}</Text>
                    <Text>
                      Estimated Time:{" "}
                      {route && route.duration
                        ? Math.round(route.duration) + " minutes"
                        : "N/A"}
                    </Text>
                    <Text>
                      Distance:{" "}
                      {route && route.distance ? route.distance + " km" : "N/A"}
                    </Text>
                  </View>
                </Callout>
              </Marker>
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
