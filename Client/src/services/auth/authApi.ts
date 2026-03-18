/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constant/Baseurl";

interface loginData {
  email: string;
  password: string;
}

export const registerApi = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "Registration successful!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Registration failed. Please try again.",
    );
    throw error;
  }
};

export const loginApi = async (data: loginData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "Login successful!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Login failed. Please try again.",
    );
    throw error;
  }
};

export const sendOtp = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/sendotp`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "OTP send successfully!");
      return response;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "failed to send OTP. Please try again.",
    );
    throw error;
  }
};

export const getTeamMembers = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/getTeamMembers`, data);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      "failed to fetch team member. Please try again.",
    );
    throw error;
  }
};

export const ValidateOtp = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/validateotp`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "OTP send successfully!");
      return response;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "failed to send OTP. Please try again.",
    );
    throw error;
  }
};

export const UpdateOtp = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/updateotp`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "Password reset successfully!");
      return response;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      "failed to reset password. Please try again.",
    );
    throw error;
  }
};

export const verifyTokenApi = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return response.data.user;
    }
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

export const getUserProfile = async (id: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/getUserProfile/${id}`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch user details");
    console.log(error);
  }
}