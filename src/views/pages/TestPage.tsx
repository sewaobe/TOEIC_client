import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Paper,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { styled, useTheme } from "@mui/material/styles";
import { useReducer, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TestCard from "../../components/Home/TestCard";
import PaginationContainer from "../../components/common/PaginationContainer";
import testService from "../../services/test.service";
import { useThrottledCallback } from "../../hooks/useThrottledCallback";
import { SecondLayout } from "../layouts/SecondLayout";

const initialState = {
  searchValue: "",
  tests: [] as any[],
  page: 1,
  pageLoaded: 1,
  totalPages: 1,
  suggestions: [] as any[],
  anchorEl: null as null | HTMLElement,
  loadingSuggest: false,
};

type State = typeof initialState;

type Action =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_TESTS"; payload: any[] }
  | { type: "APPEND_TESTS"; payload: any[] }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_LOADED"; payload: number }
  | { type: "SET_TOTAL_PAGES"; payload: number }
  | { type: "SET_SUGGESTIONS"; payload: any[] }
  | { type: "SET_ANCHOR"; payload: HTMLElement | null }
  | { type: "SET_LOADING_SUGGEST"; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchValue: action.payload };
    case "SET_TESTS":
      return { ...state, tests: action.payload };
    case "APPEND_TESTS":
      return { ...state, tests: [...state.tests, ...action.payload] };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_PAGE_LOADED":
      return { ...state, pageLoaded: action.payload };
    case "SET_TOTAL_PAGES":
      return { ...state, totalPages: action.payload };
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.payload };
    case "SET_ANCHOR":
      return { ...state, anchorEl: action.payload };
    case "SET_LOADING_SUGGEST":
      return { ...state, loadingSuggest: action.payload };
    default:
      return state;
  }
}

const ExamPage = () => {
  const theme = useTheme();
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: (theme.vars ?? theme).palette.text.primary,
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "scale(1.02)",
      boxShadow: theme.shadows[4],
    },
  }));

  const [state, dispatch] = useReducer(reducer, initialState);
  const limit = 3;

  // --- Fetch tests chính ---
  const fetchTests = async (p: number = 1, search?: string) => {
    try {
      if (p > state.pageLoaded || search || state.pageLoaded === 1) {
        const res = await testService.getTests(p, limit, search);
        if (p === 1) {
          dispatch({ type: "SET_TESTS", payload: res.tests });
        } else {
          dispatch({ type: "APPEND_TESTS", payload: res.tests });
        }
        dispatch({ type: "SET_TOTAL_PAGES", payload: res.totalPages });
        dispatch({ type: "SET_PAGE_LOADED", payload: res.page });
      }
      dispatch({ type: "SET_PAGE", payload: p });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // --- Throttled suggestion fetch ---
  const throttledFetchSuggestions = useThrottledCallback(
    async (value: string, target: HTMLElement) => {
      if (value.trim() === "") {
        dispatch({ type: "SET_SUGGESTIONS", payload: [] });
        dispatch({ type: "SET_ANCHOR", payload: null });
        fetchTests(1);
        return;
      }
      dispatch({ type: "SET_LOADING_SUGGEST", payload: true });
      try {
        const res = await testService.getTests(1, 5, value);
        dispatch({ type: "SET_SUGGESTIONS", payload: res.tests });
        dispatch({ type: "SET_ANCHOR", payload: target });
      } catch (err) {
        console.error(err);
      } finally {
        dispatch({ type: "SET_LOADING_SUGGEST", payload: false });
      }
    },
    700
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch({ type: "SET_SEARCH", payload: value });
    throttledFetchSuggestions(value, e.currentTarget);
  };

  const handleSelectSuggestion = (title: string) => {
    dispatch({ type: "SET_SEARCH", payload: title });
    dispatch({ type: "SET_ANCHOR", payload: null });
    fetchTests(1, title);
  };

  const handleSearchClick = () => {
    fetchTests(1, state.searchValue);
  };

  return (
    <MainLayout>
      <Box className="w-full flex flex-col p-8 gap-4">
        <Box className="w-full flex items-center justify-between">
          <SecondLayout>
            <Box className="w-full flex flex-col gap-4">
              <Typography
                variant="h2"
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: { xs: "3rem", md: "48px" },
                }}
                className="font-bold mb-2"
              >
                Thư viện đề thi
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, md: 4 }}
              >
                {["New economy", "2024", "2023", "2022", "2021"].map((item) => (
                  <Item key={item} onClick={() => fetchTests(1, item)}>
                    {item}
                  </Item>
                ))}
              </Stack>

              <TextField
                placeholder="Tìm kiếm..."
                variant="outlined"
                value={state.searchValue}
                onChange={handleInputChange}
                size="small"
                className="w-2/3"
                sx={{ backgroundColor: theme.palette.background.paper }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <Popper
                open={Boolean(state.anchorEl && state.suggestions.length > 0)}
                anchorEl={state.anchorEl}
                placement="bottom-start"
                style={{ zIndex: 1300 }}
              >
                <ClickAwayListener onClickAway={() => dispatch({ type: "SET_ANCHOR", payload: null })}>
                  <Paper
                    elevation={3}
                    sx={{
                      mt: 0.5,
                      width: state.anchorEl ? state.anchorEl.offsetWidth + 48 : 348,
                      maxHeight: 250,
                      overflowY: "auto",
                      borderRadius: 2,
                      ml: -6,
                    }}
                  >
                    {state.loadingSuggest ? (
                      <MenuItem sx={{ justifyContent: "center" }}>
                        <CircularProgress size={24} />
                        <Typography className="ml-2">Đang tìm...</Typography>
                      </MenuItem>
                    ) : (
                      state.suggestions.map((t) => (
                        <MenuItem
                          key={t.id}
                          onClick={() => handleSelectSuggestion(t.title)}
                          sx={{ "&:hover": { backgroundColor: theme.palette.action.hover } }}
                        >
                          {t.title}
                        </MenuItem>
                      ))
                    )}
                  </Paper>
                </ClickAwayListener>
              </Popper>

              <Button
                variant="contained"
                color="primary"
                className="rounded-full flex items-center gap-2 w-28"
                onClick={handleSearchClick}
              >
                Tìm kiếm
              </Button>
            </Box>
          </SecondLayout>
        </Box>

        <Box className="mt-8 w-full">
          <Typography
            variant="h5"
            className="!mb-4 font-extrabold underline"
            sx={{ color: theme.palette.text.primary }}
          >
            Kết quả tìm kiếm
          </Typography>

          {state.tests.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy kết quả phù hợp.
            </Typography>
          ) : (
            <PaginationContainer
              items={state.tests}
              pageCount={Number(state.totalPages)}
              page={state.page}
              onPageChange={(p) => fetchTests(p, state.searchValue)}
              containerSx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center", // căn giữa cả hàng
                gap: 2
              }}
              renderItem={(t) => (
                <TestCard
                  key={t.id}
                  _id={t.id}
                  title={t.title}
                  score={t.score}
                  topic={t.details}
                  countComment={t.totalComments}
                  countSubmit={t.totalUsers}
                  isNew={true}
                />
              )}
            />
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ExamPage;
