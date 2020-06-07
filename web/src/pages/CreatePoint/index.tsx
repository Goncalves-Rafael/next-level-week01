import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

import  './styles.css'
import logo from '../../assets/logo.svg'
import api from '../../services/api'
import { getStates, getCities } from '../../services/ibge'
import Dropzone from '../../components/Dropzone'

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface FormInput {
  name: string,
  email: string,
  whatsapp: string
}

const CreatePoint = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setPosition] = useState<[number, number]>([0, 0]);
  const [selectedItens, setSelectedItens] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormInput>({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setInitialPosition([
        position.coords.latitude,
        position.coords.longitude
      ])
    }, err => {
      setInitialPosition([-19.9239127, -43.9281205])
    });
  }, [])

  useEffect(() => {
    api.get('item')
      .then(response => {
        setItens(response.data);
    });

    getStates()
      .then(response => {
        setUfs(response.data.map(uf => uf.sigla).sort())
    });
  }, [])

  useEffect(() => {
    if (selectedUf === '0') return;
    getCities(selectedUf)
      .then(response => {
        setCities(response.data.map(city => city.nome))
    });
  }, [selectedUf])

  function handleSelectUf (event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleSelectCity (event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick (event: LeafletMouseEvent) {
    setPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleItemClick(id: number) {
    const index = selectedItens.findIndex(i => i === id);
    if (index >= 0) {
      setSelectedItens(selectedItens.filter(i => i !== id));
    } else {
      setSelectedItens([...selectedItens, id]);
    }
  }

  async function submitForm (event: FormEvent) {
    event.preventDefault();

    const data = new FormData();

    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('whatsapp', formData.whatsapp);
    data.append('city', selectedCity);
    data.append('uf', selectedUf);
    data.append('latitude', String(selectedPosition[0]));
    data.append('longitude', String(selectedPosition[1]));
    data.append('itens', selectedItens.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }


    await api.post('/point', data);
    alert('Ponto criado com sucesso!');
    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={submitForm}>
        <h1>Cadastro do<br/>ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"/>

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectUf} value={selectedUf} >
                <option value="0">Seleciona um estado</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                <option value="0">Seleciona uma cidade</option>
                {cities.map(city => (
                  <option key={'city_' + city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            {itens.map(item => (
              <li key={item.id} onClick={() => handleItemClick(item.id)} className={selectedItens.includes(item.id) ? 'selected' : ''}>
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}

export default CreatePoint;