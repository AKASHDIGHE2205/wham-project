/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BASE_URL } from "../../constant/Baseurl";
import toast from "react-hot-toast";
import { getTokenFromStorage } from "../../helper/cryptoUser";

const getHeaders = () => {
  const token = getTokenFromStorage();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getUpcomingEvents = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dashboard/getUpcomingEvents`,
      data,{...getHeaders()}
    );
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch upcoming events"
    );
    console.log(error);
  }
};

export const getActiveEvents = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dashboard/getActiveEvents`,
      data,{...getHeaders()}
    );
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch Active events"
    );
    console.log(error);
  }
};

export const getActiveSteps = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/getActiveSteps`,{...getHeaders()});
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch Active Steps"
    );
    console.log(error);
  }
};

export const getActiveTasks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/getActiveTasks`,{...getHeaders()});
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch Active Tasks"
    );
    console.log(error);
  }
};

export const getActiveTasks_old = async (params: { Id: number }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dashboard/getActiveTasks/${params.Id}`
    );
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch Active Tasks"
    );
    console.log(error);
  }
};

export const addAttendence = async (data: any) => {
  try {
    const response: any = await axios.post(
      `${BASE_URL}/dashboard/addAttendence`,
      data,{...getHeaders(),}
    );
    if (response.status === 200) {
      toast.success(response?.message || "Attendance added successfully!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to add Attendence");
    console.log(error);
  }
};

export const addSteps = async (data: any) => {
  try {
    const response: any = await axios.post(
      `${BASE_URL}/dashboard/addSteps`,
      data,{...getHeaders()}
    );
    if (response.status === 200) {
      toast.success(response?.message || "Steps added successfully!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to add Steps");
    console.log(error);
  }
};

export const getEventForAttend = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dashboard/getEventForAttend`,
      data,{...getHeaders(),}
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      toast.error(
        error.response?.data?.message || "Failed to fetch Active Tasks"
      );
      console.error(error);
    } else {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
    return null; // so caller can check for failure
  }
};

export const updateSteps = async (data: any) => {
  try {
    const response: any = await axios.put(
      `${BASE_URL}/dashboard/updateSteps`,
      data,{...getHeaders(),}
    );
    if (response.status === 200) {
      toast.success(response?.message || "Steps updated successfully!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update Steps");
    console.log(error);
  }
};

export const getMemberDetailsForDashboard = async (id: number | string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dashboard/getMemberDetailsForDashboard/${id}`,{...getHeaders(),}
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch member");
    console.error(error);
  }
};
