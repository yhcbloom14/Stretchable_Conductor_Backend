import { FileData } from "@/lib/types/File"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { FILE_SLICE_NAME } from "@/lib/constants"
import { fetchFiles } from "@/lib/data/fetch-file-list"
import { fetchCsv } from "@/lib/data/fetch-csv"

interface FileState {
    files: FileData[]
    loading: boolean
    fileDataLoading: Record<string, boolean>
}

const initialState: FileState = {
    files: [],
    loading: false,
    fileDataLoading: {}
}

// TODO: This fetches the AL, DB data in the data tab, which doesn't match the file data used in the design tab.
// Need to change this to fetch the correct file data for the design tab.
export const refreshFiles = createAsyncThunk(
    `${FILE_SLICE_NAME}/refreshFiles`,
    async (force: boolean = false, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { [FILE_SLICE_NAME]: FileState };
            const { files } = state[FILE_SLICE_NAME];
            
            // If we have files and not forcing refresh, return cached data
            if (!force && files.length > 0) {
                return files; // Return cached files instead of rejecting
            }
            
            return fetchFiles();
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

export const getFileData = createAsyncThunk(
    `${FILE_SLICE_NAME}/getFileData`,
    async (fileId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { [FILE_SLICE_NAME]: FileState };
            const { files } = state[FILE_SLICE_NAME];
            
            // Check if file data is already loaded
            const existingFile = files.find(f => f.id === fileId);
            if (existingFile?.data) {
                return rejectWithValue({ cached: true });
            }
            
            return await fetchCsv(fileId);
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

export const fileSlice = createSlice({
    name: FILE_SLICE_NAME,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(refreshFiles.pending, (state) => {
            state.loading = true
        })
        .addCase(refreshFiles.fulfilled, (state, action) => {
            state.loading = false
            state.files = action.payload
        })
        .addCase(refreshFiles.rejected, (state, action) => {
            state.loading = false
            state.files = []
        })
        .addCase(getFileData.pending, (state, action) => {
            state.fileDataLoading[action.meta.arg] = true
        })
        .addCase(getFileData.fulfilled, (state, action) => {
            const {id, data} = action.payload;
            state.fileDataLoading[id] = false
            const file = state.files.find(f => f.id === id)
            if (file) {
                file.data = data
            }
        })
        .addCase(getFileData.rejected, (state, action) => {
            // Don't clear loading state if this was a cache hit
            if (action.payload && typeof action.payload === 'object' && 'cached' in action.payload) {
                state.fileDataLoading[action.meta.arg] = false;
                return;
            }
            state.fileDataLoading[action.meta.arg] = false
        })
    },
    selectors: {
        selectFiles: (state) => {
            return state.files
        },
        selectLoading: (state) => {
            return state.loading
        },
        selectFileDataLoading: (state) => (fileId: string) => {
            return state.fileDataLoading[fileId] || false
        }
    }
})

export default fileSlice.reducer;