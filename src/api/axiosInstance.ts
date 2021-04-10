import axios from "axios";

const axiosInstance = axios.create( {
    baseURL: 'https://odinapi.asus.com/apiv2',
} )

export default axiosInstance
