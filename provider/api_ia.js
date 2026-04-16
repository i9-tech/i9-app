import axios from "axios";
import {enviroments} from "../utils/enviroments"

const api_ia = axios.create({
  baseURL: "http://0.0.0.0:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api_ia;
