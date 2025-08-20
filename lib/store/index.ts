import { configureStore } from "@reduxjs/toolkit";
import profileSlice from "./slices/profileSlice";
import { FILE_SLICE_NAME, PROFILE_SLICE_NAME, TEMPLATE_SLICE_NAME } from "@/lib/constants";
import { ORG_SLICE_NAME } from "@/lib/constants";
import orgSlice from "./slices/orgSlice";
import fileSlice from "./slices/fileSlice";
import templateSlice from "./slices/templateSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            [PROFILE_SLICE_NAME]: profileSlice,
            [ORG_SLICE_NAME]: orgSlice,
            [FILE_SLICE_NAME]: fileSlice,
            [TEMPLATE_SLICE_NAME]: templateSlice
        }
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];