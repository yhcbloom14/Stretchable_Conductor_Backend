import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { TEMPLATE_SLICE_NAME } from "@/lib/constants";
import { Template } from "@/lib/types/Template";
import { fetchTemplates } from "@/lib/data/fetch-templates";
import binderTemplateTranslationJson from "@/lib/data/mock/binder-template-translation.json";

const binderTemplateTranslation: { [key: string]: string } = binderTemplateTranslationJson;

interface TemplateState {
    templates: Template[]
    activeId: string | null
    loading: boolean
    lastFetched: number | null
    cacheValid: boolean
}

const initialState: TemplateState = {
    templates: [],
    activeId: null,
    loading: false,
    lastFetched: null,
    cacheValid: false
}

export const refreshTemplates = createAsyncThunk(
    `${TEMPLATE_SLICE_NAME}/refreshTemplates`,
    async (force: boolean = false, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { [TEMPLATE_SLICE_NAME]: TemplateState };
            const { lastFetched, cacheValid } = state[TEMPLATE_SLICE_NAME];
            
            // Cache is valid for 5 minutes (300000ms)
            const CACHE_DURATION = 5 * 60 * 1000;
            const now = Date.now();
            
            if (!force && cacheValid && lastFetched && (now - lastFetched) < CACHE_DURATION) {
                // Return cached data by rejecting with a special flag
                return rejectWithValue({ cached: true });
            }
            
            const templates = await fetchTemplates();
            return { templates, timestamp: now };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

// Base selectors
export const selectTemplates = (state: { [TEMPLATE_SLICE_NAME]: TemplateState }) => state[TEMPLATE_SLICE_NAME].templates;
export const selectActiveId = (state: { [TEMPLATE_SLICE_NAME]: TemplateState }) => state[TEMPLATE_SLICE_NAME].activeId;
const selectLoading = (state: { [TEMPLATE_SLICE_NAME]: TemplateState }) => state[TEMPLATE_SLICE_NAME].loading;

// Memoized selectors
export const selectActiveTemplate = createSelector(
    [selectTemplates, selectActiveId],
    (templates, activeId) => templates.find(template => template.id === activeId)
);

export const selectTemplateOptions = createSelector(
    [selectTemplates],
    (templates) => templates.map(template => ({
        value: template.id,
        label: template.name
    }))
);

export const selectTemplateById = createSelector(
    [selectTemplates],
    (templates) => (id: string) => templates.find(template => template.id === id)
);

export const selectTemplateNameById = createSelector(
    [selectTemplates],
    (templates) => (id: string) => templates.find(template => template.id === id)?.name || ""
);


export const selectActiveTemplateName = createSelector(
    [selectActiveTemplate],
    (activeTemplate) => activeTemplate?.name || ""
);


export const selectMaterials = createSelector(
    [selectActiveTemplate],
    (activeTemplate) => activeTemplate?.Formulation || []
);

export const selectProcess = createSelector(
    [selectActiveTemplate],
    (activeTemplate) => activeTemplate?.Process?.map(process => ({
        ...process,
        label: binderTemplateTranslation[process.label] || process.label
    })) || []
);

export const selectOutputs = createSelector(
    [selectActiveTemplate],
    (activeTemplate) => activeTemplate?.Output?.map(output => ({
        ...output,
        label: binderTemplateTranslation[output.label] || output.label
    })) || []
);

export const selectTemplateLoading = createSelector(
    [selectLoading],
    (loading) => loading ? true : false
);

export const templateSlice = createSlice({
    name: TEMPLATE_SLICE_NAME,
    initialState,
    reducers: {
        setActiveId: (state, action) => {
            state.activeId = action.payload;
        },
        invalidateCache: (state) => {
            state.cacheValid = false;
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(refreshTemplates.fulfilled, (state, action) => {
            state.loading = false;
            state.templates = action.payload.templates;
            state.lastFetched = action.payload.timestamp;
            state.cacheValid = true;
            if (!state.activeId && action.payload.templates.length > 0) {
                state.activeId = action.payload.templates[0].id;
            }
        })
        .addCase(refreshTemplates.pending, (state) => {
            state.loading = true;
        })
        .addCase(refreshTemplates.rejected, (state, action) => {
            // Don't clear templates if this was a cache hit
            if (action.payload && typeof action.payload === 'object' && 'cached' in action.payload) {
                state.loading = false;
                return;
            }
            state.loading = false;
            state.templates = [];
            state.activeId = null;
            state.cacheValid = false;
            state.lastFetched = null;
        })
    }
})

export default templateSlice.reducer;
