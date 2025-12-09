import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./authSlice";
import productReducer from "./productSlice";
import auctionReducer from "./auctionSlice";
import categoryReducer from "./categorySlice";
import orderReducer from "./orderSlice";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";

// Create a noop storage for server-side rendering
function createNoopStorage() {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
}

// Use web storage on client, noop storage on server
const persistStorage = typeof window !== "undefined" 
  ? storage 
  : createNoopStorage();

// Ensure environment variable exists
const reduxKey = process.env.NEXT_PUBLIC_REDUX_KEY || "default-secret-key";
if (!process.env.NEXT_PUBLIC_REDUX_KEY && typeof window !== "undefined") {
  console.warn(
    "NEXT_PUBLIC_REDUX_KEY is not defined in environment variables. Using default key."
  );
}

// Encryption transform configuration
const encryptor = encryptTransform({
  secretKey: reduxKey,
  onError: (error) => {
    if (typeof window !== "undefined") {
      console.error("Encryption error:", error);
      persistStorage.removeItem("persist:root");
    }
  },
});

// Redux-persist configuration
const persistConfig = {
  key: "root",
  storage: persistStorage,
  transforms: [encryptor],
  timeout: 2000,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  user: userReducer,
  products: productReducer,
  auctions: auctionReducer,
  categories: categoryReducer,
  orders: orderReducer,
});

// Persisted reducer configuration
// const persistedReducer = persistReducer(persistConfig, rootReducer);
const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer
);

// Configure the store
const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });

    if (process.env.NODE_ENV !== "production") {
      middlewares.push(logger); // 👈 now works fine
    }

    return middlewares;
  },

  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
