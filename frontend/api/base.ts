import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8000',  // <-- computer ip   192.168.1.2
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api; 