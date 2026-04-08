import { configureStore } from '@reduxjs/toolkit'
import themeReducer from "./features/ThemeSlice";
import passwordReducer from "./features/passwordSlice";
import cardReducer from "./features/cardSlice";
import toastReducer from "./features/toastSlice"

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    password: passwordReducer,
    cards : cardReducer,
    toast : toastReducer
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;