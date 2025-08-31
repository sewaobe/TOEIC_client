import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import userService from "../services/user.service";
import { User } from "../types/user";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean; // thêm flag
  error: string | null;
}

export const getUserThunk = createAsyncThunk<User>(
  "user/get",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getProfile();
      return res.user;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unauthorized");
    }
  }
);

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false, // ban đầu false
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = true; // tránh fetch lại
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
    },
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(getUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true; // mark initialized để FE không gọi lại
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, setAuth } = userSlice.actions;
export default userSlice.reducer;
