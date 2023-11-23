import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

function ListDetailsScreen({ route }) {
  const { list } = route.params;
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the server/database using axios
    axios
      .get(`http://localhost:3000/products/${list.ListID}`)
      .then((response) => {
        // Update the state with the retrieved data
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [list.ListID]); // Make sure to include list.ListID in the dependency array

  return (
    <View>
      <Text style={styles.title}>List {list.ListID}</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>Name: {item.ProductName}</Text>
            <Text>Price: {item.Price}</Text>
            <Text>Category: {item.Category}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    marginTop: 60,
    marginBottom: 20,
    marginLeft: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default ListDetailsScreen;
