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
  Grid,
  Pagination,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { alpha, useTheme } from "@mui/material/styles";
import { useReducer, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TestCard from "../../components/Home/TestCard";
import testService from "../../services/test.service";
import { useThrottledCallback } from "../../hooks/useThrottledCallback";
import { SecondLayout } from "../layouts/SecondLayout";
import { useSearchParams } from "react-router-dom";

const initialState = {
  searchValue: "",
  tests: [] as any[],
  page: 1,
  pageLoaded: 1,
  totalPages: 1,
  suggestions: [] as any[],
  anchorEl: null as null | HTMLElement,
  loadingSuggest: false,
  loadingTests: false,
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
  | { type: "SET_LOADING_SUGGEST"; payload: boolean }
  | { type: "SET_LOADING_TESTS"; payload: boolean };

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
    case "SET_LOADING_TESTS":
      return { ...state, loadingTests: action.payload };
    default:
      return state;
  }
}

type CategoryFilter = {
  label: string;
  keywords?: string;
  year?: string;
};

const CATEGORY_FILTERS: CategoryFilter[] = [
  { label: "All" },
  { label: "YBM 2025", keywords: "YBM 2025" },
  { label: "New economy", keywords: "New economy" },
  { label: "ETS 2026", year: "2026" },
  { label: "ETS 2024", year: "2024" },
  { label: "ETS 2023", year: "2023" },
  { label: "ETS 2022", year: "2022" },
  { label: "ETS 2021", year: "2021" },
  { label: "ETS 2020", year: "2020" },
  { label: "ETS 2019", year: "2019" },
];

const ExamPage = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const [state, dispatch] = useReducer(reducer, initialState);
  const limit = 6;

  const updateQueryParams = ({
    page,
    keywords,
    year,
  }: {
    page?: number;
    keywords?: string | null;
    year?: string | null;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (page !== undefined) {
      if (page > 1) {
        nextParams.set("page", String(page));
      } else {
        nextParams.delete("page");
      }
    }

    if (keywords !== undefined) {
      if (keywords && keywords.trim()) {
        nextParams.set("keywords", keywords.trim());
      } else {
        nextParams.delete("keywords");
      }
    }

    if (year !== undefined) {
      if (year && year.trim()) {
        nextParams.set("year", year.trim());
      } else {
        nextParams.delete("year");
      }
    }

    setSearchParams(nextParams);
  };

  // --- Fetch tests chính ---
  const fetchTests = async (
    p: number = 1,
    filters?: { keywords?: string; year?: string },
  ) => {
    dispatch({ type: "SET_LOADING_TESTS", payload: true });
    try {
      const res = await testService.getTests(p, limit, filters);
      dispatch({ type: "SET_TESTS", payload: res.tests });
      dispatch({
        type: "SET_TOTAL_PAGES",
        payload: Number(res.totalPages) || 1,
      });
      dispatch({ type: "SET_PAGE_LOADED", payload: Number(res.page) || 1 });
      dispatch({ type: "SET_PAGE", payload: Number(res.page) || 1 });
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: "SET_LOADING_TESTS", payload: false });
    }
  };

  const queryKey = searchParams.toString();

  useEffect(() => {
    const pageFromQuery = Number(searchParams.get("page") || "1");
    const page =
      Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
    const keywords = searchParams.get("keywords")?.trim() || "";
    const year = searchParams.get("year")?.trim() || "";

    dispatch({ type: "SET_SEARCH", payload: keywords });
    dispatch({ type: "SET_ANCHOR", payload: null });

    fetchTests(page, { keywords, year });
  }, [queryKey]);

  // --- Throttled suggestion fetch ---
  const throttledFetchSuggestions = useThrottledCallback(
    async (value: string, target: HTMLElement) => {
      if (value.trim() === "") {
        dispatch({ type: "SET_SUGGESTIONS", payload: [] });
        dispatch({ type: "SET_ANCHOR", payload: null });
        return;
      }
      dispatch({ type: "SET_LOADING_SUGGEST", payload: true });
      try {
        const res = await testService.getTests(1, 5, {
          keywords: value.trim(),
        });
        dispatch({ type: "SET_SUGGESTIONS", payload: res.tests });
        dispatch({ type: "SET_ANCHOR", payload: target });
      } catch (err) {
        console.error(err);
      } finally {
        dispatch({ type: "SET_LOADING_SUGGEST", payload: false });
      }
    },
    700,
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch({ type: "SET_SEARCH", payload: value });
    throttledFetchSuggestions(value, e.currentTarget);
  };

  const handleSelectSuggestion = (title: string) => {
    dispatch({ type: "SET_SEARCH", payload: title });
    dispatch({ type: "SET_ANCHOR", payload: null });
    updateQueryParams({ keywords: title, year: null, page: 1 });
  };

  const handleSearchClick = () => {
    updateQueryParams({
      keywords: state.searchValue.trim() || null,
      year: null,
      page: 1,
    });
  };

  const handleCategoryFilter = (filter: CategoryFilter) => {
    dispatch({ type: "SET_SUGGESTIONS", payload: [] });
    dispatch({ type: "SET_ANCHOR", payload: null });

    if (!filter.keywords && !filter.year) {
      dispatch({ type: "SET_SEARCH", payload: "" });
      updateQueryParams({ year: null, keywords: null, page: 1 });
      return;
    }

    if (filter.year) {
      dispatch({ type: "SET_SEARCH", payload: "" });
      updateQueryParams({ year: filter.year, keywords: null, page: 1 });
      return;
    }

    dispatch({ type: "SET_SEARCH", payload: filter.keywords || "" });
    updateQueryParams({ keywords: filter.keywords || null, year: null, page: 1 });
  };

  const selectedKeywords = searchParams.get("keywords")?.trim().toLowerCase() || "";
  const selectedYear = searchParams.get("year")?.trim() || "";

  const isCategoryActive = (filter: CategoryFilter) => {
    if (!filter.keywords && !filter.year) {
      return !selectedKeywords && !selectedYear;
    }

    if (filter.year) {
      return selectedYear === filter.year;
    }

    return selectedKeywords === (filter.keywords || "").toLowerCase();
  };

  const activeCategoryBg = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.24 : 0.12,
  );
  const activeCategoryText =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  const activeCategoryBorder = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.55 : 0.35,
  );
  const activeCategoryHoverBg = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.34 : 0.2,
  );

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
                  fontSize: { xs: "2.25rem", md: "44px" },
                  lineHeight: 1.1,
                }}
                className="font-bold"
              >
                Thư viện đề thi
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {CATEGORY_FILTERS.map((item) => {
                  const isActive = isCategoryActive(item);

                  return (
                    <Button
                      key={item.label}
                      onClick={() => handleCategoryFilter(item)}
                      variant="outlined"
                      color="primary"
                      sx={{
                        height: 36,
                        px: 1.75,
                        borderRadius: "2px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        minWidth: { xs: "auto", sm: 104 },
                        borderColor: isActive
                          ? activeCategoryBorder
                          : theme.palette.divider,
                        backgroundColor: isActive
                          ? activeCategoryBg
                          : theme.palette.background.paper,
                        color: isActive
                          ? activeCategoryText
                          : theme.palette.text.primary,
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: isActive
                            ? activeCategoryBorder
                            : theme.palette.text.secondary,
                          backgroundColor: isActive
                            ? activeCategoryHoverBg
                            : theme.palette.action.hover,
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ width: "100%", maxWidth: 640 }}
              >
                <TextField
                  placeholder="Tìm kiếm..."
                  variant="outlined"
                  value={state.searchValue}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "2px",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearchClick}
                  sx={{
                    borderRadius: "2px",
                    px: 2,
                    minWidth: { xs: 132, sm: 124 },
                    height: 40,
                    fontWeight: 700,
                  }}
                >
                  Tìm kiếm
                </Button>
              </Stack>

              <Popper
                open={Boolean(state.anchorEl && state.suggestions.length > 0)}
                anchorEl={state.anchorEl}
                placement="bottom-start"
                style={{ zIndex: 1300 }}
              >
                <ClickAwayListener
                  onClickAway={() =>
                    dispatch({ type: "SET_ANCHOR", payload: null })
                  }
                >
                  <Paper
                    elevation={3}
                    sx={{
                      mt: 0.5,
                      width: state.anchorEl
                        ? state.anchorEl.offsetWidth + 48
                        : 348,
                      maxHeight: 250,
                      overflowY: "auto",
                      borderRadius: "2px",
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
                          sx={{
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
                          {t.title}
                        </MenuItem>
                      ))
                    )}
                  </Paper>
                </ClickAwayListener>
              </Popper>

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

          {state.loadingTests ? (
            <Box className="w-full flex items-center justify-center py-10 gap-3">
              <CircularProgress size={28} />
              <Typography variant="body1" color="text.secondary">
                Đang tải đề thi...
              </Typography>
            </Box>
          ) : state.tests.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy kết quả phù hợp.
            </Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                {state.tests.map((t) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
                    <Stack
                      sx={{
                        width: "100%",
                        alignItems: "stretch",
                        "& > *": { width: "100%" },
                      }}
                    >
                      <TestCard
                        _id={t.id}
                        title={t.title}
                        score={t.score}
                        topic={t.details}
                        countComment={t.totalComments || 0}
                        countSubmit={t.totalUsers || 0}
                        isNew={true}
                      />
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={Number(state.totalPages)}
                  page={state.page}
                  onChange={(_, value) => updateQueryParams({ page: value })}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ExamPage;
