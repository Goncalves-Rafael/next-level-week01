import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, ImageBackground} from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { Feather as Icon } from '@expo/vector-icons'
import RNPickerSelect from 'react-native-picker-select';

import { getCities, getStates } from '../../services/ibge';

const logoImage = require('../../assets/logo.png')
const homeBackground = require('../../assets/home-background.png');

interface Option {
  label: string,
  value: string
}

const Home = () => {
  const [ ufOptions, setUfOptions] = useState<Option[]>([] as Option[]);
  const [ cityOptions, setCityOptions] = useState<Option[]>([] as Option[]);
  const [ selectedUf, setSelectedUf] = useState<string>('');
  const [ selectedCity, setSelectedCity] = useState<string>('');
  const navigation = useNavigation();
  
  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      uf: selectedUf,
      city: selectedCity
    })
  }

  useEffect(() => {
    getStates().then(response => {
      setUfOptions(response.data.sort().map(el => {
        return {
          label: el.sigla,
          value: el.sigla
        }
      }))
    })
    .catch(err => {
      console.log(err)
    })
  }, [])

  function handleChangeUf(uf: string) {
    setSelectedUf(uf)
    getCities(uf).then(response => {
      setCityOptions(response.data.map(el => {
        return {
          label: el.nome,
          value: el.nome
        }
      }))
    })
    .catch(err => {
      handleChangeUf(uf)
    })
  }

  function handleChangeCity(city: string) {
    setSelectedCity(city)
  }

  return (
    <ImageBackground
      style={styles.container}
      source={homeBackground}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={logoImage} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
      </View>
        <RNPickerSelect
          style={styles}
          items={ufOptions}
          onValueChange={handleChangeUf} 
          placeholder={{ label: 'Selecione um Estado' }}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <Icon size={20} color="black" name="arrow-down" />
          }}
        />
        <RNPickerSelect
          style={styles} 
          items={cityOptions} 
          onValueChange={handleChangeCity} 
          placeholder={{ label: 'Selecione uma Cidade' }}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <Icon size={20} color="black" name="arrow-down" />
          }}
        />
      <View>

      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
          <Text>
            <Icon name="arrow-right" color="#FFF" size={24}></Icon>
          </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 88,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {
    color: 'black'
  },

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },
  
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 10,
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingLeft: 8,
    height: 60
  },

  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#FFF',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingLeft: 8,
    height: 60
  },
  iconContainer: {
    top: 20,
    right: 20
  }
});