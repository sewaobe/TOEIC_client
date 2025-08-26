import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/user.service";

interface UserState {
  name?: string;
  gmail?: string;
  avatarUrl?: string;
}

const initialState: UserState = {};

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const data = await userService.getCurrentUser();
      // chỉ lấy 3 trường cần thiết
      return {
        name: data.fullname,
        gmail: data.email,
        avatarUrl: data.avatar,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
  },
});

export const { updateUser } = userSlice.actions;
export default userSlice.reducer;
