import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HighlightPopupState {
  enabled: boolean;
}

const initialState: HighlightPopupState = {
  enabled: true,
};

const highlightPopupSlice = createSlice({
  name: "highlightPopup",
  initialState,
  reducers: {
    enableHighlightPopup: (state) => {
      state.enabled = true;
    },
    disableHighlightPopup: (state) => {
      state.enabled = false;
    },
    setHighlightPopupEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
  },
});

export const { enableHighlightPopup, disableHighlightPopup, setHighlightPopupEnabled } =
  highlightPopupSlice.actions;
export default highlightPopupSlice.reducer;
