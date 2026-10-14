import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { apiRequest } from '../../api.ts'
import type { ConversionResult, Direction } from './types.ts'

// The same limits the server enforces.
export const MAX_TEXT_CHARS = 20_000
export const MAX_TARGET_ROLE_CHARS = 100

interface ConversionState {
  from: Direction
  to: string
  text: string
  targetRole: string
  status: 'idle' | 'converting' | 'done' | 'error'
  result: ConversionResult | null
  error: string | null
}

const DEFAULT_TARGET = 'US'

const initialState: ConversionState = {
  from: 'IL',
  to: DEFAULT_TARGET,
  text: '',
  targetRole: '',
  status: 'idle',
  result: null,
  error: null,
}

export const convertCv = createAsyncThunk.withTypes<{ state: { conversion: ConversionState } }>()(
  'conversion/convert',
  (_, { getState }) => {
    const { from, to, text, targetRole } = getState().conversion
    const role = targetRole.trim()
    return apiRequest<ConversionResult>('/api/convert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, text, ...(role ? { targetRole: role } : {}) }),
    })
  },
)

const conversionSlice = createSlice({
  name: 'conversion',
  initialState,
  reducers: {
    // A CV from abroad can only go to Israel, so the target follows the direction.
    setFrom(state, action: PayloadAction<Direction>) {
      if (action.payload === state.from) return
      state.from = action.payload
      state.to = action.payload === 'ABROAD' ? 'IL' : DEFAULT_TARGET
    },
    setTo(state, action: PayloadAction<string>) {
      state.to = action.payload
    },
    setText(state, action: PayloadAction<string>) {
      state.text = action.payload
    },
    setTargetRole(state, action: PayloadAction<string>) {
      state.targetRole = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(convertCv.pending, (state) => {
        state.status = 'converting'
        state.result = null
        state.error = null
      })
      .addCase(convertCv.fulfilled, (state, action) => {
        state.status = 'done'
        state.result = action.payload
      })
      .addCase(convertCv.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Unknown error.'
      })
  },
})

export const { setFrom, setTo, setText, setTargetRole } = conversionSlice.actions
export default conversionSlice.reducer
