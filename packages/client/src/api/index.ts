import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

api.interceptors.response.use(
  response => {
    if (response.data.code === 0) {
      return response.data.data
    }
    return Promise.reject(new Error(response.data.message || '请求失败'))
  },
  error => {
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

export default api
