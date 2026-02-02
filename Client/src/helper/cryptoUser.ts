/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { secretKey } from "../constant/Baseurl";

export interface User {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  token: string;
}

// Update your decryptUser utility to handle the nested structure
export const decryptUser = <T = any>(
  encrypted: string | undefined,
): T | null => {
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;

    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error("Decryption failed", error);
    return null;
  }
};

// Get user from storage with proper typing
export const getUserFromStorage = (): User | null => {
  const encryptedData = Cookies.get("user");
  const decryptedData = decryptUser<any>(encryptedData);

  // Handle both cases: if user data is nested or direct
  // if (decryptedData?.user) {
  //   return decryptedData.user as User;
  // } else

  if (decryptedData?.id) {
    return decryptedData as User;
  }

  return null;
};

// Also get the token if needed
export const getTokenFromStorage = (): string | null => {
  const encryptedData = Cookies.get("user");
  const decryptedData = decryptUser<any>(encryptedData);
  return decryptedData?.token || null;
};
