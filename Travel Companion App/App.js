/* StAuth10244: I Ethan Breau, 000906500 certify that this material is my original work. 
No other person's work has been used without due acknowledgement. I have not made my work available to anyone else. */

import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Modal,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import PagerView from "react-native-pager-view";

export default function App() {
  // State hook for current region
  const [region, setRegion] = useState(null);

  // Effect hook to request location permission and get current location on mount
  useEffect(() => {
    // Async function to handle location access and setting region
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);
  // State hooks for various features like points of interest, modal visibility, etc.
  const [pois, setPois] = useState([]);
  const [selectedPoiType, setSelectedPoiType] = useState("restaurant");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  // Similar effect hook to the above, but it also fetches Places of Interest (POIs) after updating the region
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);

        // Fetch POIs after updating the region
        fetchPOIs(
          newRegion.latitude,
          newRegion.longitude,
          selectedPoiType
        ).then(setPois);
      } catch (error) {
        console.error("Failed to get current location: ", error);
      }
    })();
  }, []);

  // Function to fetch points of interest (POIs) from Google Places API
  const fetchPOIs = async (latitude, longitude, type) => {
    const apiKey = "AIzaSyD-rAlywAaoHswuuR2V-v9F4Jt278AiTEA"; // API key deleted. Sensitive data would not normally be included in code.
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${type}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      console.log("API response: ", response.data);
      return response.data.results.map((poi) => ({
        ...poi,
        photo_reference: poi.photos?.[0]?.photo_reference,
      }));
    } catch (error) {
      console.error("Error fetching POIs: ", error);
      return [];
    }
  };

  // Function to handle POI type selection and update POIs based on the type
  const handleSelectPoiType = (type) => {
    setSelectedPoiType(type);
    fetchPOIs(region.latitude, region.longitude, type).then(setPois);
    setModalVisible(false);
  };

  // Function to update the user's current location
  const findMyLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setMyLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  return (
    // SafeAreaView to ensure the app UI renders correctly on all devices
    <SafeAreaView style={{ flex: 1 }}>
      {/* Modal for selecting POI types */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", marginTop: 350 }}>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: "#007BFF",
                padding: 10,
                alignItems: "center",
                marginHorizontal: 2,
              }}
              onPress={() => handleSelectPoiType("restaurant")}
            >
              <Text style={{ color: "#FFFFFF" }}>Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginTop: 10,
                marginHorizontal: 2,
                backgroundColor: "#007BFF",
                padding: 10,
                alignItems: "center",
              }}
              onPress={() => handleSelectPoiType("museum")}
            >
              <Text style={{ color: "#FFFFFF" }}>Museums</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginTop: 10,
                marginHorizontal: 2,
                backgroundColor: "#007BFF",
                padding: 10,
                alignItems: "center",
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#FFFFFF" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal for displaying selected photo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedPhoto}
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          {selectedPhoto && (
            <Image
              style={{ width: 300, height: 300 }}
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${selectedPhoto}&key=AIzaSyD-rAlywAaoHswuuR2V-v9F4Jt278AiTEA`,
              }}
            />
          )}
          <TouchableOpacity
            style={{
              backgroundColor: "#007BFF",
              padding: 10,
              alignItems: "center",
              borderRadius: 5,
              marginTop: 5,
              width: 300,
            }}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={{ color: "#FFFFFF" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Main view for the map and POI list */}
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* MapView showing current region and markers for POIs */}
        {region && (
          <MapView style={{ flex: 1 }} region={region}>
            {pois.map((poi) => (
              <Marker
                key={poi.place_id}
                coordinate={{
                  latitude: poi.geometry.location.lat,
                  longitude: poi.geometry.location.lng,
                }}
                title={poi.name}
              />
            ))}
            {myLocation && (
              <Marker
                coordinate={myLocation}
                title="My Location"
                pinColor="blue"
              />
            )}
          </MapView>
        )}
        {/* PagerView for swiping through POIs */}
        <PagerView
          style={{
            flex: 0.1,
            marginTop: "auto",
            backgroundColor: "lightgrey",
          }}
          initialPage={0}
        >
          {pois.map((poi, index) => (
            <View
              key={index}
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text>{poi.name}</Text>
                  <Text>{poi.vicinity}</Text>
                </View>
                {poi.photo_reference && (
                  <TouchableOpacity
                    onPress={() => setSelectedPhoto(poi.photo_reference)}
                  >
                    <Image
                      style={{ width: 50, height: 50, marginLeft: 10 }}
                      source={{
                        uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${poi.photo_reference}&key=AIzaSyD-rAlywAaoHswuuR2V-v9F4Jt278AiTEA`,
                      }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </PagerView>
        {/* Buttons for finding user location and selecting POIs */}
        <TouchableOpacity
          style={{
            backgroundColor: "#007BFF",
            padding: 10,
            alignItems: "center",
            marginTop: 2,
          }}
          onPress={findMyLocation}
        >
          <Text style={{ color: "#FFFFFF" }}>Find My Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: 2,
            backgroundColor: "#007BFF",
            padding: 10,
            alignItems: "center",
          }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "#FFFFFF" }}>Select Places of Interest</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
