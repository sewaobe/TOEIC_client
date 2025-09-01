import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
// import Paper from "@mui/material/Paper";
import { styled, useTheme } from "@mui/material/styles";
import { useState, useEffect, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import UserExamCard from "../../components/exams/UserExamCard";
import TestCard from "../../components/Home/TestCard";
import PaginationContainer from "../../components/PaginationContainer";
import testService from "../../services/test.service";
import { Popper, Paper, ClickAwayListener } from "@mui/material";

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

  const [searchValue, setSearchValue] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageLoaded, setPageLoaded] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const limit = 2;
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  // --- Fetch tests chính ---
  const fetchTests = async (p: number = 1, search?: string) => {
    try {
      if (p > pageLoaded || search || pageLoaded === 1) {
        const res = await testService.getTests(p, limit, search);
        setTests((prev) => (p === 1 ? res.tests : [...prev, ...res.tests]));
        setTotalPages(res.totalPages);
        setPageLoaded(res.page);
      }
      setPage(p);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // --- Throttled suggestion fetch ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (throttleRef.current) clearTimeout(throttleRef.current);

    const target = e.currentTarget; // lưu input element cho Menu
    throttleRef.current = setTimeout(async () => {
      // Nếu input trống, reset về full list
      if (value.trim() === "") {
        setSuggestions([]);
        setAnchorEl(null);
        fetchTests(1); // load lại toàn bộ tests
        return;
      }

      setLoadingSuggest(true);
      try {
        const res = await testService.getTests(1, 5, value);
        setSuggestions(res.tests);
        setAnchorEl(target);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggest(false);
      }
    }, 3000); // 3s
  };

  const handleSelectSuggestion = (title: string) => {
    setSearchValue(title);
    setAnchorEl(null);
    fetchTests(1, title);
  };

  const handleSearchClick = () => {
    fetchTests(1, searchValue);
  };

  return (
    <MainLayout>
      <Box className="w-full flex flex-col p-8 gap-4">
        <Box className="w-full flex items-center justify-between">
          <Box className="w-full flex flex-col gap-4">
            {/* Tiêu đề */}
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

            {/* Search các năm */}
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

            {/* Input search */}
            <TextField
              placeholder="Tìm kiếm..."
              variant="outlined"
              value={searchValue}
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

            {/* Gợi ý bằng Menu */}
            <Popper
              open={Boolean(anchorEl && suggestions.length > 0)}
              anchorEl={anchorEl}
            >
              <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <Paper
                  style={{ maxHeight: 200, width: 300, overflowY: "auto" }}
                >
                  {loadingSuggest ? (
                    <MenuItem>
                      <CircularProgress size={24} />
                      <Typography className="ml-2">Đang tìm...</Typography>
                    </MenuItem>
                  ) : (
                    suggestions.map((t) => (
                      <MenuItem
                        key={t.id}
                        onClick={() => handleSelectSuggestion(t.title)}
                      >
                        {t.title}
                      </MenuItem>
                    ))
                  )}
                </Paper>
              </ClickAwayListener>
            </Popper>

            {/* Button tìm kiếm */}
            <Button
              variant="contained"
              color="primary"
              className="rounded-full flex items-center gap-2 w-28"
              onClick={handleSearchClick}
            >
              Tìm kiếm
            </Button>
          </Box>

          <div className="basis-1/3">
            <UserExamCard
              userId="22110285"
              examDate="30/08/2025"
              daysLeft={2}
              targetScore={700}
              onEditDate={() => console.log("Edit date")}
              onViewStats={() => console.log("View stats")}
            />
          </div>
        </Box>

        {/* Kết quả tìm kiếm */}
        <Box className="mt-8 w-full">
          <Typography
            variant="h5"
            className="!mb-4 font-extrabold underline"
            sx={{ color: theme.palette.text.primary }}
          >
            Kết quả tìm kiếm
          </Typography>

          {tests.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy kết quả phù hợp.
            </Typography>
          ) : (
            <PaginationContainer
              items={tests}
              pageCount={Number(totalPages)}
              itemsPerPage={limit}
              page={page}
              onPageChange={(p) => fetchTests(p, searchValue)}
              renderItem={(t) => (
                <TestCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  details={t.details}
                  score={t.score}
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
