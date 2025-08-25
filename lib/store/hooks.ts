import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from "react-redux";
import type { RootState, AppDispatch, AppStore } from "./index";

//export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppDispatch: () => AppDispatch = useDispatch;

//export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

//export const useAppStore = useStore.withTypes<AppStore>();
export const useAppStore: () => AppStore = useStore;