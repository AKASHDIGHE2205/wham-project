/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BASE_URL } from "../../constant/Baseurl";
import toast from "react-hot-toast";

export const addEvent = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/calendar/add-event`, data);
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
    const response = await axios.post(`${BASE_URL}/calendar/get-event`, data);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch events");
    console.log(error);
  }
};

export const updateEvent = async (data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/calendar/update-event`, data);
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
    const response = await axios.put(`${BASE_URL}/calendar/delete-event`, data);
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
    const response = await axios.get(`${BASE_URL}/calendar/get-members`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch members");
    console.log(error);
  }
};

export const getActiveTeams = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/calendar/get-teams`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch teams");
    console.log(error);
  }
};
