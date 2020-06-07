import axios from 'axios';

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const apiIbge = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades'
})

export function getStates() {
  return apiIbge.get<IBGEUFResponse[]>('/estados')
}

export function getCities(uf: string) {
  return apiIbge.get<IBGECityResponse[]>(`/estados/${uf}/municipios`)
}

export default apiIbge;