import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../api.ts'

export interface Country {
  code: string
  name: string
  documentName: string
  paperSize: 'A4' | 'Letter'
}

interface CountriesState {
  items: Country[]
  status: 'idle' | 'loading' | 'loaded' | 'error'
  error: string | null
}

const initialState: CountriesState = { items: [], status: 'idle', error: null }

// Loaded once: a call while one is running, or after one has succeeded, does nothing.
export const loadCountries = createAsyncThunk.withTypes<{ state: { countries: CountriesState } }>()(
  'countries/load',
  () => apiRequest<Country[]>('/api/countries'),
  {
    condition: (_, { getState }) => {
      const { status } = getState().countries
      return status === 'idle' || status === 'error'
    },
  },
)

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCountries.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadCountries.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.items = action.payload
      })
      .addCase(loadCountries.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Unknown error.'
      })
  },
})

export default countriesSlice.reducer
