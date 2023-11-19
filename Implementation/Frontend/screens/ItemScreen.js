import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Button } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";

const ItemScreen = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>{"< Back"}</Text>
      </TouchableOpacity>
      <Card containerStyle={styles.card}>
        {/* Top part of the card for the picture */}
        <Card.Image source={{ uri: item.image }} style={styles.cardImage} />
        {/* Top left on the picture: Name of the supermarket */}
        <Text style={styles.supermarketName}>{item.c.toUpperCase()}</Text>
        <View style={styles.infoNamePrice}>
          {/* Below the picture to the left: Name of the item */}
          <Text style={styles.productName}>{item.n}</Text>
          {/* Bottom of the card: Price and Add to List button */}
          <View style={styles.bottomContainer}>
            <Text style={styles.productPrice}>€{item.p}</Text>
          </View>
        </View>
        <Button
          style={styles.addButton}
          title="+ Add to list"
          onPress={() => {
            // Your logic for adding to the list
            console.log("Add to list clicked");
          }}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    top: 10,
    left: 10,
    alignSelf: "flex-start",
    zIndex: 1,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007bff",
  },
  card: {
    width: "90%", // Set a fixed width for the card
    borderRadius: 5,
    overflow: "hidden", // Ensure the image stays within the card boundaries
    marginTop: 60,
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  supermarketName: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 10,
    color: "white",
  },
  infoNamePrice: {
    padding: 10,
    flexDirection: "row",
  },
  productName: {
    fontSize: 16,
    width: "88%",
  },
  productPrice: {
    fontSize: 14,
    color: "#007bff",
    alignSelf: "flex-end",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
  },
});

export default ItemScreen;
