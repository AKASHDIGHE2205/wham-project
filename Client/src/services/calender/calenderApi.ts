/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const addEvent = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/calendar/add-event`, data, {
      ...getHeaders(),
    });
    if (response.status === 201) {
      toast.success(response.data.message || "Event added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add event");
    console.log(error);
  }
};

export const getEvent = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/calendar/get-event`, data, {
      ...getHeaders(),
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch events");
    console.log(error);
  }
};

export const updateEvent = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/calendar/update-event`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 200) {
      toast.success(response.data.message || "Event updated successfully");
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update event");
    console.log(error);
  }
};

export const deleteEvent = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/calendar/delete-event`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 200) {
      toast.success(response.data.message || "Event deleted successfully");
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete event");
    console.log(error);
  }
};

export const getAllMembers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/calendar/get-members`, {
      ...getHeaders(),
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch members");
    console.log(error);
  }
};

export const getActiveTeams = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/calendar/get-teams`, {
      ...getHeaders(),
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch teams");
    console.log(error);
  }
};

// -------------------------------------------------------------------
export const getActiveOccasions = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/calendar/getActiveOccasions`,
      { ...getHeaders() },
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch Occasions");
    console.log(error);
  }
};
export const getActiveCompaign = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/calendar/getActiveCompaigns`,
      { ...getHeaders() },
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch Compaign.");
    console.log(error);
  }
};
export const addActivity = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/calendar/add-activity`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 201) {
      toast.success(response.data.message || "Activity added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add activity");
    console.log(error);
  }
};
export const getActivities = async (data:  {
  userId: number;
  role: string;
  startDate?: string;
  endDate?: string;
  view?: string;
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/calendar/getActivities`,
      data,
      { ...getHeaders() },
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch Occasions");
    console.log(error);
  }
};
export const getActivityDetails = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/calendar/getActivitiesDetails`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add activity");
    console.log(error);
  }
};
export const updateActivity = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/calendar/updateActivity`,
      data,
      { ...getHeaders() },
    );
    if (response.status === 200) {
      toast.success(response.data.message || "Activity updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update activity");
    console.log(error);
  }
};