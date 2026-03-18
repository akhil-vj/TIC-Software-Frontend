import { axiosDelete } from "./AxiosInstance";
import { URLS } from "../constants/Urls";

export function deleteHotelImage(imageId) {
  return axiosDelete(`${URLS.HOTEL_URL}/images/${imageId}`);
}