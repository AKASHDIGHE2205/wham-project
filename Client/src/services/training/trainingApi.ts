// services/training/trainingApi.ts
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constant/Baseurl";
import { getTokenFromStorage } from "../../helper/cryptoUser";

const getHeaders = () => {
  const token = getTokenFromStorage();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const addTraining = async (data: FormData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/training/addTraining`,
      data,
      {
        ...getHeaders(),
      },
    );
    if (response.status === 201) {
      toast.success(response.data.message || "Training added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add training");
    console.log(error);
  }
};
export const getAllTrainings = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/training/getAllTrainings`, {
      params,
      ...getHeaders(),
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch trainings");
    console.log(error);
  }
};
export const getTrainingDetails = async (id: number) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/training/getTrainingDetails/${id}`,
      { ...getHeaders() },
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch training");
    console.log(error);
  }
};
export const updateTraining = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/training/updateTraining`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 200) {
      toast.success(response.data.message || "Training updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update training");
    console.log(error);
  }
};
export const getActiveTrainings = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/training/getActiveTrainings`,
      { ...getHeaders() },
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch trainings");
    console.log(error);
  }
};
export const deactivateTraining = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/training/deactivateTraining`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 200) {
      toast.success(response.data.message || "Training updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update training");
    console.log(error);
  }
};
