// import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
// import userService from "../services/user.service";
// import { User } from "../types/user";

// // 1. Async thunk để fetch user
// export const fetchCurrentUser = createAsyncThunk(
//   "user/fetchCurrentUser",
//   async (_, thunkAPI) => {
//     try {
//       const response = await userService.getCurrentUser();
//       return response.user; // chỉ trả về user thôi
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err);
//     }
//   }
// );

// // 2. initial state của user
// interface UserState {
//   currentUser: User | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: UserState = {
//   currentUser: null,
//   loading: false,
//   error: null,
// };

// // 3. user slice
// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     updateUser: (state, action: PayloadAction<Partial<User>>) => {
//       if (state.currentUser) {
//         state.currentUser = { ...state.currentUser, ...action.payload };
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCurrentUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
//         state.currentUser = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchCurrentUser.rejected, (state, action) => {
//         state.error = action.error.message || "Failed to fetch user";
//         state.loading = false;
//       });
//   },
// });

// export const { updateUser } = userSlice.actions;
// export default userSlice.reducer;
