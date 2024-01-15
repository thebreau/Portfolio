// StAuth10244: I Ethan Breau, 000906500 certify that this material is my original work.
// No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import base64 from "react-native-base64";

// Main component of the app
export default function App() {
  // Converts copper currency to gold, silver, and copper
  const convertCurrency = (copper) => {
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const remainingCopper = copper % 100;

    return `${gold}g ${silver}s ${remainingCopper}c`;
  };

  // Component to display each auction item
  const AuctionItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* Item details */}
      <View style={styles.leftContainer}>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Item ID: {item.item.id}
        </Text>
        <Text style={{ color: "white", fontWeight: "bold", marginBottom: 20 }}>
          Quantity: {item.quantity}
        </Text>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Time Left: {item.time_left}
        </Text>
      </View>
      {/* Bid and Buyout buttons */}
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Bid: {convertCurrency(item.bid)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Buyout: {convertCurrency(item.buyout)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Blizzard API credentials
  const clientId = "9de927a97fed4bfa9f3cb65b27f14bc4"; // credentials are no longer valid, normally would not place sensitive information directly in code.
  const clientSecret = "RUUVNjdSQFB6MH5jI7DeKUVoRJ48nVPs";

  // State hooks for auction data, filtering, and auction house selection
  const [auctionData, setAuctionData] = useState([]);
  const [filteredAuctionData, setFilteredAuctionData] = useState([]);
  const [itemId, setItemId] = useState("");
  const [auctionHouse, setAuctionHouse] = useState(2); // Default to Alliance

  // Sets auction house and fetches data
  const setAuctionHouseAndFetch = (houseValue) => {
    setFilteredAuctionData([]);
    setAuctionHouse(houseValue);
    fetchAuctions();
  };

  // Fetch auctions on component mount and when auctionHouse changes
  useEffect(() => {
    fetchAuctions();
  }, [auctionHouse]);

  // Fetches auctions from the Blizzard API
  const fetchAuctions = async () => {
    setFilteredAuctionData([]);
    const accessToken = await fetchAccessToken(clientId, clientSecret);
    try {
      const response = await axios.get(
        `https://us.api.blizzard.com/data/wow/connected-realm/4395/auctions/${auctionHouse}?namespace=dynamic-classic-us&locale=en_US&access_token=${accessToken}`
      );
      setAuctionData(response.data.auctions);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
  };

  // Fetches access token for Blizzard API
  const fetchAccessToken = async () => {
    try {
      const authHeader = base64.encode(`${clientId}:${clientSecret}`);
      const response = await axios.post(
        "https://oauth.battle.net/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  };

  // Filters auctions by item ID
  const fetchAuctionsByItemId = () => {
    const filteredData = auctionData.filter(
      (auction) => auction.item.id.toString() === itemId
    );
    setFilteredAuctionData(filteredData);
  };

  // Button component for selecting auction house
  const AuctionHouseButton = ({ title, houseValue, currentHouse }) => (
    <TouchableOpacity
      style={[
        styles.auctionButton,
        {
          backgroundColor: houseValue === currentHouse ? "#0074e0" : "#23252b",
        },
      ]}
      onPress={() => setAuctionHouse(houseValue)}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  // Main rendering of the app interface
  return (
    <SafeAreaView style={styles.container}>
      {/* Warcraft image display */}
      <Image
        source={require("./assets/warcraft.png")}
        style={styles.image}
        resizeMode="contain"
      />
      {/* Auction house selection buttons */}
      <View style={styles.buttonGroup}>
        <AuctionHouseButton
          title="Alliance"
          houseValue={2}
          currentHouse={auctionHouse}
          onPress={() => setAuctionHouseAndFetch(2)}
        />
        <AuctionHouseButton
          title="Horde"
          houseValue={6}
          currentHouse={auctionHouse}
          onPress={() => setAuctionHouseAndFetch(6)}
        />
        <AuctionHouseButton
          title="Neutral"
          houseValue={7}
          currentHouse={auctionHouse}
          onPress={() => setAuctionHouseAndFetch(7)}
        />
      </View>
      {/* Refresh auctions button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchAuctions}>
        <Text style={styles.buttonText}>Refresh Auctions</Text>
      </TouchableOpacity>
      {/* Item ID input field */}
      <TextInput
        style={styles.input}
        placeholder="Enter Item ID"
        placeholderTextColor={"white"}
        value={itemId}
        onChangeText={setItemId}
        onSubmitEditing={fetchAuctionsByItemId}
      />

      {/* Auction items list */}
      <FlatList
        data={
          filteredAuctionData.length > 0 ? filteredAuctionData : auctionData
        }
        renderItem={({ item }) => <AuctionItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: "#15171e",
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    marginVertical: 8,
    backgroundColor: "#23252b",
    borderRadius: 5,
  },
  leftContainer: {
    flex: 1,
    marginTop: 8,
  },
  rightContainer: {
    flex: 1,
  },
  list: {
    width: "100%",
  },
  button: {
    backgroundColor: "#0074e0",
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  image: {
    width: 400,
    height: 150,
    alignSelf: "center",
  },
  input: {
    height: 40,
    borderColor: "#0074e0",
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    color: "white",
  },
  buttonGroup: {
    flexDirection: "row",
  },
  auctionButton: {
    backgroundColor: "#0074e0",
    padding: 10,
    borderRadius: 5,
    marginRight: 2,
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#0074e0",
    padding: 10,
    borderRadius: 5,
  },
});
