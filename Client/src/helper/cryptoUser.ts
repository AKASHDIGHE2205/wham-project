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
  isOrganizer: string | "Y" | "N";
}

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
export const getUserFromStorage = (): User | null | any => {
  const encryptedData = Cookies.get("user");
  const decryptedData = decryptUser<any>(encryptedData);
  if (decryptedData?.id) {
    return decryptedData as User;
  }
  return null;
};
export const getTokenFromStorage = (): string | null => {
  const encryptedData = Cookies.get("user");
  const decryptedData = decryptUser<any>(encryptedData);
  return decryptedData?.token || null;
};
