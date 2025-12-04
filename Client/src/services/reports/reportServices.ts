/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BASE_URL } from "../../constant/Baseurl";
import toast from "react-hot-toast";

export const report1 = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/reports/report1`, data);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to fetch Data");
    console.log(error);
  }
};

export const getMedia = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/reports/getMedia`, data);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to fetch Data");
    console.log(error);
  }
};
