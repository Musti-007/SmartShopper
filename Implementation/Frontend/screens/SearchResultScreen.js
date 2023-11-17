// // import React from "react";
// // import { View, Text, FlatList, ScrollView, StyleSheet } from "react-native";

// // const SearchResultScreen = ({ route }) => {
// //   const { searchText, filteredProducts } = route.params;

// //   return (
// //     <View>
// //       <Text style={styles.title}>
// //         Search Results for <Text style={styles.boldText}>"{searchText}"</Text>
// //       </Text>
// //       <View style={styles.searchresultContainer}>
// //         <FlatList
// //           data={filteredProducts}
// //           keyExtractor={(item, index) => index.toString()}
// //           renderItem={({ item }) => (
// //             <View style={styles.productItem}>
// //               <Text style={styles.productName}>{item.n}</Text>
// //               <Text style={styles.productPrice}>€{item.p}</Text>
// //               <Text style={styles.supermarketName}>{item.c}</Text>
// //             </View>
// //           )}
// //         />
// //       </View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   title: {
// //     fontSize: 20,
// //     // textAlign: "center",
// //     marginTop: 20,
// //     padding: 20,
// //   },
// //   boldText: {
// //     fontWeight: "bold",
// //   },
// //   searchresultContainer: {
// //     backgroundColor: "white",
// //     borderRadius: 5,
// //     padding: 10,
// //     marginTop: 10,
// //     width: "90%",
// //     borderColor: "gray",
// //     borderWidth: 1,
// //     alignSelf: "center",
// //     height: "70%",
// //   },
// //   productItem: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: 10,
// //     borderBottomWidth: 1,
// //     borderColor: "gray",
// //   },
// //   productName: {
// //     fontSize: 16,
// //     width: "70%",
// //   },
// //   productPrice: {
// //     fontSize: 14,
// //     color: "#007bff",
// //   },
// //   supermarketName: {
// //     fontSize: 14,
// //     color: "black", // You can change the color as per your preference
// //   },
// // });

// // export default SearchResultScreen;

// import React, { useState } from "react";
// import { View, Text, FlatList, StyleSheet } from "react-native";
// import { SearchBar } from "react-native-elements"; // Adjust the import based on your library

// const SearchResultScreen = ({ route }) => {
//   const { searchText, filteredProducts } = route.params;
//   const [searchInput, setSearchInput] = useState("");

//   return (
//     <View>
//       <SearchBar
//         placeholder="Search..."
//         onChangeText={(text) => setSearchInput(text)}
//         value={searchInput}
//       />
//       <Text style={styles.title}>
//         Search Results for <Text style={styles.boldText}>"{searchText}"</Text>
//       </Text>
//       <View style={styles.searchresultContainer}>
//         <FlatList
//           data={filteredProducts}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={({ item }) => (
//             <View style={styles.productItem}>
//               {/* Display product image here */}
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.productName}>{item.n}</Text>
//                 <Text style={styles.productPrice}>€{item.p}</Text>
//                 <Text style={styles.supermarketName}>{item.c}</Text>
//               </View>
//               <View>
//                 {/* Add to List button */}
//                 <Text>Add to List</Text>
//               </View>
//             </View>
//           )}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 20,
//     marginTop: 20,
//     padding: 20,
//   },
//   boldText: {
//     fontWeight: "bold",
//   },
//   searchresultContainer: {
//     backgroundColor: "white",
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 10,
//     width: "90%",
//     borderColor: "gray",
//     borderWidth: 1,
//     alignSelf: "center",
//     height: "70%",
//   },
//   productItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderColor: "gray",
//   },
//   productName: {
//     fontSize: 16,
//   },
//   productPrice: {
//     fontSize: 14,
//     color: "#007bff",
//   },
// });

// export default SearchResultScreen;
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SearchBar, Card, Button } from "react-native-elements";

const SearchResultScreen = ({ route, navigation }) => {
  const [searchText, setSearchText] = useState("");
  const { filteredProducts } = route.params;

  const handleSearch = (text) => {
    setSearchText(text);
  };

  return (
    <View>
      <SearchBar
        placeholder="Search for an item"
        onChangeText={handleSearch}
        value={searchText}
        onSubmitEditing={() => {
          if (searchText.trim() !== "") {
            navigation.navigate("SearchResult", {
              searchText,
              filteredProducts,
            });
          }
        }}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
      />
      <Text style={styles.title}>
        Search Results for <Text style={styles.boldText}>"{searchText}"</Text>
      </Text>
      <View style={styles.searchresultContainer}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card containerStyle={styles.cardContainer}>
              {/* Top part of the card for the picture */}
              {/* Replace 'item.image' with the actual property for the image */}
              <Card.Image
                source={{ uri: item.image }}
                style={styles.cardImage}
              />

              {/* Top left on the picture: Name of the supermarket */}
              <Text style={styles.supermarketName}>{item.c.toUpperCase()}</Text>

              {/* Below the picture to the left: Name of the item */}
              <Text style={styles.productName}>{item.n}</Text>

              {/* Price of the item */}
              <Text style={styles.productPrice}>€{item.p}</Text>

              {/* Very bottom part of the card: Add to List button */}
              <Button
                title="+"
                onPress={() => {
                  // Your logic for adding to the list
                  console.log("Add to list clicked");
                }}
                buttonStyle={styles.addButton}
              />
            </Card>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    // marginTop: 20,
    padding: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchBarInput: {
    backgroundColor: "#e0e0e0",
  },
  searchresultContainer: {
    // marginTop: 10,
    width: "90%",
    alignSelf: "center",
  },
  cardContainer: {
    marginBottom: 5,
    // width: "40%",
  },
  cardImage: {
    height: 200, // Set the height of the image as needed
  },
  supermarketName: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "white", // Adjust the color as per your design
  },
  productName: {
    fontSize: 16,
    marginTop: 10,
  },
  productPrice: {
    fontSize: 14,
    color: "#007bff",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#007bff", // Adjust the color as per your design
  },
});

export default SearchResultScreen;
