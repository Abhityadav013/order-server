import { configureStore } from "@reduxjs/toolkit";
import { cartApi } from "./api/cartApi"; // created in next step
import { addressApi } from "./api/addressApi";
// import { orderApi } from './api/orderApi';
// import orderReducer from './slices/orderSlice';
import mobileReducer from "./slices/mobileSlice";
import addressReducer from "./slices/addressSlice"; // Assuming you have an addressSlice
import basketReducer from "./slices/basketSlice"; // Assuming you have a basketSlice
import navigationReducer from "./slices/navigationSlice";
import { baseApi } from "./api/baseApi";
// import couponReducer from './slices/discountCoupon';
// import { availableCouponApi } from './api/availableCouponsApi';
export const store = configureStore({
  reducer: {
    [cartApi.reducerPath]: cartApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
    // [customerDetailsApi.reducerPath]: customerDetailsApi.reducer,
    // [orderApi.reducerPath]: orderApi.reducer,
    // [availableCouponApi.reducerPath]: availableCouponApi.reducer,
    // order: orderReducer,
    mobile: mobileReducer,
    address: addressReducer, // Assuming you have an addressReducer
    basket: basketReducer, // Assuming you have a basketReducer
    navigation: navigationReducer,
    // coupon: couponReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      cartApi.middleware,
      addressApi.middleware,
      baseApi.middleware
      // orderApi.middleware,
      // availableCouponApi.middleware // ✅ Add this
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
