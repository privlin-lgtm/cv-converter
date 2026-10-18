import { configureStore } from '@reduxjs/toolkit'
import conversion from './features/conversion/conversionSlice.ts'
import countries from './features/countries/countriesSlice.ts'
import rating from './features/rating/ratingSlice.ts'

// A function, so each test can start from an empty store. Nothing is persisted: CV text must not
// outlive the tab.
export function makeStore() {
  return configureStore({ reducer: { countries, conversion, rating } })
}

export const store = makeStore()

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
