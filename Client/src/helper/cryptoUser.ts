import CryptoJS from "crypto-js";
import { secretKey } from "../constant/Baseurl";
export interface User {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "Admin" | "Master" | "Manager" | "User";
  token: string;
}

export const decryptUser = <T = User>(encrypted: string | null): T | null => {
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption failed", error);
    return null;
  }
};

export const getUserFromStorage = <T = User>(): T | null => {
  const encryptedUser = localStorage.getItem("user");
  return decryptUser<T>(encryptedUser);
};
