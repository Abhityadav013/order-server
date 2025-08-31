// lib/rtk/baseApi.ts
import { base_url } from "@/lib/apiEndPoint";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: base_url,
    credentials: "include", // include cookies if backend sets them
    prepareHeaders: (headers) => {
      const tid = localStorage.getItem("tid");
      const ssid = localStorage.getItem("ssid");
      headers.set("Content-Type", "application/json");
      if (ssid && tid) {
        headers.set("x-device-id", ssid);
        headers.set("x-tid", tid);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
