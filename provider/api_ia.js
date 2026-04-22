import axios from "axios";
import {enviroments} from "../utils/enviroments"

const api_ia = axios.create({
  baseURL: "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api_ia;
