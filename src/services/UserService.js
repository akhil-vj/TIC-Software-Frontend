import { axiosPut, filePut } from "./AxiosInstance";
import { URLS } from "../constants/Urls"; // Ensure this path is correct

export function updateProfile(userData) {
    if (userData instanceof FormData) {
        return filePut(URLS.USER_UPDATE_URL, userData);
    }
    return axiosPut(URLS.USER_UPDATE_URL, userData);
}
