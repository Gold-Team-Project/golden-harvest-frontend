
import { type AxiosInstance } from 'axios';

declare module '@/api/axios' {
  const http: AxiosInstance;
  export default http;
}
