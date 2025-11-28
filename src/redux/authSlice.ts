import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  role: "user" | "admin";
  avatar: string;
  status: "0" | "1"; // coming as "1" from backend, use string enum or boolean if backend changes
  otp: string | null;
  otp_expires_at: string | null;
  add_interest: string[];
  bible_version: string;
  age: string; // e.g., "35-44"
  is_profile_complete: "Yes" | "No";
  token: string;
}

const initialState: UserState = {
  id: 0,
  first_name: "",
  last_name: "",
  email: "",
  email_verified_at: "",
  created_at: "",
  updated_at: "",
  role: "user",
  avatar: "",
  status: "0",
  otp: null,
  otp_expires_at: null,
  add_interest: [],
  bible_version: "",
  age: "",
  is_profile_complete: "No",
  token: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      Object.assign(state, action.payload);
    },
    resetUser() {
      return initialState;
    },
  },
});

export const { updateUser, resetUser, setUser } = userSlice.actions;
export default userSlice.reducer;
