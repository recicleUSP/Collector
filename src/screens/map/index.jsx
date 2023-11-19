import React, { useState, useEffect, useContext } from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View } from 'react-native';
import { styles } from './style';
import * as Location from 'expo-location';
import { SimpleIcon } from '../../components/icons';
import { Colors, Theme } from '../../constants/setting';
import { RecyclableCard } from './components/recyclable_card';
import { GetRecyclable } from '../../firebase/providers/recyclable';
import { Loading } from '../../components/loading';
import { Error } from '../../components/error';
import { ButtonIcon } from '../../components/buttons';
import { RecyclableList } from './components/recyclable_list';
import { ColetorContext } from '../../contexts/coletor/context';
MapboxGL.setAccessToken("pk.eyJ1IjoicmVjaWNsZXBsdXMiLCJhIjoiY2xvajF5aW1sMWlsdzJycXQxc3NkenkwNCJ9.Qc8tAGWwl65imT225djhLw");

function Map() {
  const [location, setLocation] = useState({
    latitude: -22.004313,
    longitude: -47.896467,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const { coletorState, coletorDispach } = useContext(ColetorContext);

  const [recyclable, setRecyclable] = useState({});
  const [error, setError] = useState(false);
  const [addRecyclable, setAddRecyclable] = useState(false);
  const [listRecyclable, setListRecyclable] = useState(false);
  const [currentRecyclable, setCurrentRecyclable] = useState({});
  const [loading, setLoading] = useState(false);

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({});
    // setLocation({
    //   latitude: location.coords.latitude,
    //   longitude: location.coords.longitude,
    //   latitudeDelta: 0.015,
    //   longitudeDelta: 0.0121,
    // });
  };

  function callbackError(error) {
    setError(error);
  }

  function showRecyclable(current) {
    setCurrentRecyclable(current);
    setAddRecyclable(true);
  }

  useEffect(() => {
    userLocation();
    GetRecyclable(setRecyclable);
  }, []);

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {error && <Error error={error} closeFunc={() => setError(false)} />}
      {addRecyclable && (
        <RecyclableCard
          data={currentRecyclable}
          collector={coletorState}
          callbackError={callbackError}
          closeCard={() => setAddRecyclable(false)}
          setloading={(val = true) => setLoading(val)}
        />
      )}

      {listRecyclable && (
        <RecyclableList
          datas={recyclable}
          collector={coletorState}
          showRecyclable={showRecyclable}
          currentLocation={location}
          setError={setError}
          setLoading={setLoading}
          closeList={() => setListRecyclable(false)}
        />
      )}

      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street} scaleBarEnabled={false}> 
        <MapboxGL.Camera
          zoomLevel={14}
          centerCoordinate={[location.longitude, location.latitude]}
        />
        <MapboxGL.PointAnnotation
          id="userLocation"
          coordinate={[location.longitude, location.latitude]}
        >
          <SimpleIcon name="circle-slice-8" size={30} color={'#3FA28B'} />
        </MapboxGL.PointAnnotation>
        <MapboxGL.CircleLayer
          id="circle"
          style={{ circleRadius: 150, circleColor: '#00FFC4' }}
          aboveLayerID="userLocation"
        />
        {recyclable &&
          Object.entries(recyclable).map(([index, item]) => {
            if (item['status'] === 'done') return null;

            return (
              <MapboxGL.PointAnnotation
                id={index}
                coordinate={[
                  item['address'].longitude,
                  item['address'].latitude,
                ]}
                key={index}
                onSelected={() => {
                  if (
                    item['status'] === 'pending' ||
                    item.collector.id === coletorState.id
                  ) {
                    setCurrentRecyclable({
                      id: index,
                      ...item,
                    });
                    setAddRecyclable(true);
                  } else {
                    setError({
                      title: 'Indisponível',
                      content:
                        'Esta coleta já foi selecionada por outro coletor.',
                    });
                  }
                }}
              >
                <SimpleIcon
                  name={
                    item['status'] === 'pending'
                      ? 'map-marker-account'
                      : 'map-marker-alert'
                  }
                  size={40}
                  color={
                    item['status'] === 'pending'
                      ? '#0bbae3'
                      : item.collector.id === coletorState.id
                      ? '#179a02'
                      : '#faa05e'
                  }
                />
              </MapboxGL.PointAnnotation>
            );
          })}
      </MapboxGL.MapView>

      <View style={styles.floatButton}>
        <ButtonIcon
          btn={true}
          name={'menu'}
          size={35}
          color={Colors[Theme][4]}
          fun={() => setListRecyclable(true)}
        />
      </View>
    </View>
  );
}

export { Map };
