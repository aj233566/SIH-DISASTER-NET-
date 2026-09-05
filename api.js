import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

export const submitIncident = async (formData) => {
  const response = await api.post('/incidents', formData)

  return response.data
}

export default api