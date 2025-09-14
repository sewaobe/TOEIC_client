import { Snackbar, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../stores/store";
import { hideSnackbar } from "../../stores/snackbarSlice";

export default function GlobalSnackbar() {
    const dispatch = useDispatch<AppDispatch>();
    const { open, message, severity } = useSelector((state: RootState) => state.snackbar);

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={() => dispatch(hideSnackbar())}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ top: 64 }}
        >
            <Alert onClose={() => dispatch(hideSnackbar())} severity={severity} sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
