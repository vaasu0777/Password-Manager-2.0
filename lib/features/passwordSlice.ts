import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Password {
  site: string;
  username: string;
  password: string;
}

interface PasswordState {
  passwords: Password[];
}

const initialState: PasswordState = {
  passwords: [],
};

const passwordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    setPasswords: (state, action: PayloadAction<Password[]>) => {
      state.passwords = action.payload;
    },
    addPassword: (state, action: PayloadAction<Password>) => {
      state.passwords.push(action.payload);
    },
    deletePassword: (state, action: PayloadAction<number>) => {
      state.passwords.splice(action.payload, 1);
    },
  },
});

export const { setPasswords, addPassword, deletePassword } = passwordSlice.actions;
export default passwordSlice.reducer;