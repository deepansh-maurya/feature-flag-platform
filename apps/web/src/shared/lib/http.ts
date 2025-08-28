import axios from 'axios';
import { API_BASE } from './config';

export const http = axios.create({ baseURL: API_BASE, withCredentials: true });

export function setAuthToken(token?: string) {
  if (token) http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete http.defaults.headers.common['Authorization'];
}
