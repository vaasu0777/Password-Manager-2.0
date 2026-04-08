import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ToastOptions, Bounce } from "react-toastify";

type ToastState = {
  toastObj: ToastOptions;
};

const initialState: ToastState = {
  toastObj: {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  },
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToastOptions: (state, action: PayloadAction<Partial<ToastOptions>>) => {
      state.toastObj = { ...state.toastObj, ...action.payload };
    },
  },
});

export const { setToastOptions } = toastSlice.actions;
export default toastSlice.reducer;