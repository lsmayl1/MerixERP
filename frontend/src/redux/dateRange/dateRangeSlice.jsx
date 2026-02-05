import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  from: null,
  to: null,
  selectedRange: "today",
};

export const dateRangeSlice = createSlice({
  name: "dateRange",
  initialState,
  reducers: {
    getRange: (state, action) => {
      state.from = action.payload.from;
      state.to = action.payload.to;
      // allow caller to optionally include selectedRange in payload
      if (action.payload.selectedRange !== undefined) {
        state.selectedRange = action.payload.selectedRange;
      }
    },
    selectRange: (state, action) => {
      // action.payload is the selected range key (string)
      state.selectedRange = action.payload;
    },
  },
});

export const { getRange, selectRange } = dateRangeSlice.actions;

export default dateRangeSlice.reducer;
