import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HighlightPopupState {
  enabled: boolean;
}

const initialState: HighlightPopupState = {
  enabled: false,
};

const highlightPopupSlice = createSlice({
  name: "highlightPopup",
  initialState,
  reducers: {
    enableHighlightPopup: (state) => {
      console.log("[Redux] enableHighlightPopup");
      state.enabled = true;
    },
    disableHighlightPopup: (state) => {
      console.log("[Redux] disableHighlightPopup");
      state.enabled = false;
    },
    setHighlightPopupEnabled: (state, action: PayloadAction<boolean>) => {
      console.log("[Redux] setHighlightPopupEnabled:", action.payload);
      state.enabled = action.payload;
    },
  },
});

export const { enableHighlightPopup, disableHighlightPopup, setHighlightPopupEnabled } =
  highlightPopupSlice.actions;
export default highlightPopupSlice.reducer;
