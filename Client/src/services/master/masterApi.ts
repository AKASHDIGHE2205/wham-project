/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BASE_URL } from "../../constant/Baseurl";
import toast from "react-hot-toast";

export const newTeam = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/add-team`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "New team added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add team");
    console.log(error);
  }
};

export const getAllTeams = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllteams`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch teams");
    console.log(error);
  }
};

export const updateTeam = async (data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/master/edit-team`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "team updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update team");
    console.log(error);
  }
};

export const getAllMembers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllmembers`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch teams");
    console.log(error);
  }
};

export const addMember = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/addMember`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "New member added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add team");
    console.log(error);
  }
};

export const getMemberDetails = async (id: number | string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/master/getmemberDetails/${id}`
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch member");
    console.error(error);
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getUsers`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch users");
    console.log(error);
  }
};

export const updateMember = async (data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/master/update-member`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "Member updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update Member");
    console.log(error);
  }
};

export const getAllSidebarMembers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllmembers`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch teams");
    console.log(error);
  }
};

export const getAllSteps = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllSteps`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch tasks");
    console.log(error);
  }
};

export const addStep = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/add-step`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "New step added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add step");
    console.log(error);
  }
};

export const updateStep = async (data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/master/update-step`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "Step updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update step");
    console.log(error);
  }
};

export const getAllTasks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllTasks`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch tasks");
    console.log(error);
  }
};

export const addTask = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/add-task`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "New task added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add task");
    console.log(error);
  }
};

export const updateTask = async (data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/master/update-task`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "Task updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update task");
    console.log(error);
  }
};
