import React from 'react';
import { useFonts, Montserrat_700Bold, Montserrat_300Light, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { ColetorProvider } from './src/contexts/coletor';
import { Routes } from './src/routes/index';

const App = () => {
  const [fontLoaded] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontLoaded) {
    return null;
  }

  return (
    <ColetorProvider>
      <Routes />
    </ColetorProvider>
  );
};

//AppRegistry.registerComponent('RECICLE++', () => App);

export default App;
