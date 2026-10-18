import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../api.ts'
import { convertCv } from '../conversion/conversionSlice.ts'
import type { Direction } from '../conversion/types.ts'

export const MAX_COMMENT_CHARS = 500

export type VsChatbot = 'better' | 'same' | 'worse' | 'not_tried'

interface RatingInput {
  vsChatbot: VsChatbot
  score: number
  comment: string
}

interface RatingState {
  status: 'idle' | 'sending' | 'sent' | 'error'
  error: string | null
}

const initialState: RatingState = { status: 'idle', error: null }

export const submitRating = createAsyncThunk.withTypes<{ state: { conversion: { from: Direction; to: string } } }>()(
  'rating/submit',
  ({ vsChatbot, score, comment }: RatingInput, { getState }) => {
    const { from, to } = getState().conversion
    const note = comment.trim()
    return apiRequest<{ id: number }>('/api/ratings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, vsChatbot, score, ...(note ? { comment: note } : {}) }),
    })
  },
)

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(convertCv.pending, () => initialState)
      .addCase(submitRating.pending, (state) => {
        state.status = 'sending'
        state.error = null
      })
      .addCase(submitRating.fulfilled, (state) => {
        state.status = 'sent'
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Unknown error.'
      })
  },
})

export default ratingSlice.reducer
