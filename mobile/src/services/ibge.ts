import axios from 'axios';

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const apiIbge = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades',
  timeout: 5000
})

export function getStates() {
  return apiIbge.get<IBGEUFResponse[]>('/estados')
}

export function getCities(uf: string) {
  return apiIbge.get<IBGECityResponse[]>(`/estados/${uf}/municipios`, { timeout: 50000 })
}

export default apiIbge;