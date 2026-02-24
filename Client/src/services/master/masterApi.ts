/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BASE_URL } from "../../constant/Baseurl";
import toast from "react-hot-toast";

export const getAllUsers = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllUsers`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch users");
    console.log(error);
  }
};

export const activeUser = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/activeUser`, data);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update users");
    console.log(error);
  }
};

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

export const getAllTeams = async (params: any) => {
  const response = await axios.get(`${BASE_URL}/master/getAllteams`, {
    params,
  });
  return response.data;
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

export const getAllMembers = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllmembers`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch members");
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
      `${BASE_URL}/master/getmemberDetails/${id}`,
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

export const getAllSidebarMembers = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/master/getAllSidebarMembers`,
      data,
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch teams");
    console.log(error);
  }
};

export const getAllSteps = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllSteps`, {
      params,
    });
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

export const getAllTasks = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllTasks`, {
      params,
    });
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

export const addUniversity = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/addUniversity`, data);
    if (response.status === 201) {
      toast.success(
        response.data.message || "New university added successfully",
      );
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add university");
    console.log(error);
  }
};
export const getAllUniversities = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllUniversities`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch College");
    console.log(error);
  }
};
export const getUniversityDetails = async (id: number) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/master/getUniversityDetails/${id}`,
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch college");
    console.log(error);
  }
};
export const updateUniversity = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/master/update-university`,
      data,
    );
    if (response.status === 200) {
      toast.success(response.data.message || "University updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update university");
    console.log(error);
  }
};
export const getActiveUniversities = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/master/getActiveUniversities`,
    );
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch universities",
    );
    console.log(error);
  }
};

export const addCollege = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/master/addCollege`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "New College added successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add College");
    console.log(error);
  }
};
export const getAllColleges = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAllColleges`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch College");
    console.log(error);
  }
};
export const getCollegeDetails = async (id: number) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/master/getCollegeDetails/${id}`,
    );
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch college");
    console.log(error);
  }
};
export const updateCollege = async (data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/master/update-College`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "College updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update college");
    console.log(error);
  }
};

export const getActiveColleges = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getActiveColleges`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch colleges");
    throw error;
  }
};

export const getAllDepartments = async (params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/master/getAlldepartments`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch department");
    console.log(error);
  }
};
export const addDepartment = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/master/add-department`,
      data,
    );
    if (response.status === 201) {
      toast.success(
        response.data.message || "New department added successfully",
      );
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to add department");
    console.log(error);
  }
};
export const updateDepartment = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/master/update-department`,
      data,
    );
    if (response.status === 200) {
      toast.success(response.data.message || "department updated successfully");
      return response.data;
    }
  } catch (error: string | any) {
    toast.error(error.response?.data?.message || "Failed to update department");
    console.log(error);
  }
};
