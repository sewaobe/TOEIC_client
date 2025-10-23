import React, { useState, useCallback, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Menu,
    MenuItem
} from "@mui/material";
import DataGrid, {
    Column,
    FillEvent,
    CellKeyDownArgs,
    CellKeyboardEvent,
    RenderEditCellProps
} from "react-data-grid";
import "react-data-grid/lib/styles.css"; // <- quan trọng

// Kiểu dữ liệu row
interface FlashcardRow {
    _id: number;
    word: string;
    definition: string;
    example1: string;
    example2: string;
    phonetic: string;
    notes: string;
}

interface BatchFlashcardModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (rows: any[]) => void;
}

// Editor component (input)
function TextEditor<R, SR>({
    row,
    column,
    onRowChange,
    onClose
}: RenderEditCellProps<R, SR>) {
    return (
        <input
            className="rdg-text-editor"
            value={(row as any)[column.key] ?? ""}
            onChange={(e) =>
                onRowChange({ ...(row as any), [column.key]: e.target.value }, true)
            }
            onBlur={() => onClose(true)}
            autoFocus
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                padding: "0 4px"
            }}
        />
    );
}

function PlaceholderCell<R>({ row, column }: { row: R; column: any }) {
    const value = (row as any)[column.key];
    const placeholderMap: Record<string, string> = {
        word: "Nhập từ mới...",
        definition: "Nhập định nghĩa...",
        example1: "Ví dụ 1...",
        example2: "Ví dụ 2...",
        phonetic: "Phiên âm...",
        notes: "Ghi chú..."
    };

    return (
        <span
            style={{
                color: value ? "inherit" : "#9e9e9e",
                fontStyle: value ? "normal" : "italic"
            }}
        >
            {value || placeholderMap[column.key] || ""}
        </span>
    );
}

const BatchFlashcardModal: React.FC<BatchFlashcardModalProps> = ({
    open,
    onClose,
    onSave
}) => {
    const [rows, setRows] = useState<FlashcardRow[]>([]);

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        rowId: number | null;
    } | null>(null);

    const columns: Column<FlashcardRow>[] = [
        { key: "_id", name: "ID", width: 60, frozen: true },
        { key: "word", name: "Từ mới", renderCell: PlaceholderCell, renderEditCell: TextEditor },
        { key: "definition", name: "Định nghĩa", renderCell: PlaceholderCell, renderEditCell: TextEditor },
        { key: "example1", name: "Ví dụ 1", renderCell: PlaceholderCell, renderEditCell: TextEditor },
        { key: "example2", name: "Ví dụ 2", renderCell: PlaceholderCell, renderEditCell: TextEditor },
        { key: "phonetic", name: "Phiên âm", renderCell: PlaceholderCell, renderEditCell: TextEditor },
        { key: "notes", name: "Ghi chú", renderCell: PlaceholderCell, renderEditCell: TextEditor }
    ];

    // Fill data (Excel-like)
    const handleFill = useCallback((event: FillEvent<FlashcardRow>): FlashcardRow => {
        return {
            ...event.targetRow,
            [event.columnKey]:
                event.sourceRow[event.columnKey as keyof FlashcardRow]
        };
    }, []);

    // New row when ENTER at last row
    const handleCellKeyDown = useCallback(
        (args: CellKeyDownArgs<FlashcardRow>, event: CellKeyboardEvent) => {
            if (event.key === "Enter" && args.rowIdx === rows.length - 1) {
                event.preventDefault();
                const newRow: FlashcardRow = {
                    _id: rows.length + 1,
                    word: "",
                    definition: "",
                    example1: "",
                    example2: "",
                    phonetic: "",
                    notes: ""
                };
                setRows([...rows, newRow]);
            }
        },
        [rows]
    );

    // Insert row (dịch id xuống)
    const insertRow = useCallback(
        (rowId: number, position: "above" | "below") => {
            const rowIdx = rows.findIndex(r => r._id === rowId);
            if (rowIdx === -1) return;

            const newRow: FlashcardRow = {
                _id: 0,
                word: "",
                definition: "",
                example1: "",
                example2: "",
                phonetic: "",
                notes: ""
            };

            const newRows = [...rows];
            const insertIndex = position === "above" ? rowIdx : rowIdx + 1;
            newRows.splice(insertIndex, 0, newRow);

            // normalize id
            const normalized = newRows.map((r, i) => ({ ...r, _id: i + 1 }));
            setRows(normalized);
            setContextMenu(null);
        },
        [rows]
    );

    const deleteRow = useCallback(
        (rowId: number) => {
            const rowIdx = rows.findIndex(r => r._id === rowId);
            if (rowIdx === -1) return;

            const newRows = rows.filter((r) => r._id !== rowId)
                .map((r, i) => ({ ...r, _id: i + 1 }));
            setRows(newRows);
            setContextMenu(null);
        },
        [rows]
    );

    useEffect(() => {
        if (open && rows.length === 0) {
            setRows([
                { _id: 1, word: "", definition: "", example1: "", example2: "", phonetic: "", notes: "" }
            ]);
        }
        return () => {
            setRows([]);
        }
    }, [open]);

    const handleCloseMenu = () => setContextMenu(null);

    const handleCellContextMenu = useCallback((args: any, event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            rowId: args.row._id
        });
    }, []);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" disableScrollLock>
            <DialogTitle>Tạo Flashcards Hàng Loạt</DialogTitle>
            <DialogContent>
                <div style={{ height: 500 }}>
                    <DataGrid
                        columns={columns}
                        rows={rows}
                        rowKeyGetter={(row) => row._id}
                        onRowsChange={setRows}
                        onFill={handleFill}
                        onCellKeyDown={handleCellKeyDown}
                        onCellContextMenu={handleCellContextMenu}
                        className="rdg-light"
                    />
                </div>

                <Menu
                    open={contextMenu !== null}
                    onClose={handleCloseMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
                    <MenuItem
                        onClick={() =>
                            contextMenu?.rowId !== null &&
                            insertRow(contextMenu!.rowId, "above")
                        }
                    >
                        ➕ Chèn hàng phía trên
                    </MenuItem>
                    <MenuItem
                        onClick={() =>
                            contextMenu?.rowId !== null &&
                            insertRow(contextMenu!.rowId, "below")
                        }
                    >
                        ➕ Chèn hàng phía dưới
                    </MenuItem>
                    <MenuItem
                        onClick={() =>
                            contextMenu?.rowId !== null && deleteRow(contextMenu!.rowId)
                        }
                    >
                        ❌ Xóa hàng
                    </MenuItem>
                </Menu>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button
                    onClick={() => {
                        const filteredRows = rows
                            .filter(row => {
                                const hasWord = row.word.trim() !== "";
                                const hasAnyContent = Object.entries(row)
                                    .some(([key, value]) => key !== "_id" && String(value || "").trim() !== "");
                                return hasWord && hasAnyContent;
                            })
                            .map(({ _id, example1, example2, ...rest }) => {
                                // 🔁 Gom 2 example vào 1 mảng examples[]
                                const examples = [];
                                if (example1?.trim()) examples.push({ en: example1.trim(), vi: "" });
                                if (example2?.trim()) examples.push({ en: example2.trim(), vi: "" });

                                return {
                                    ...rest,
                                    examples,
                                };
                            });

                        if (filteredRows.length === 0) {
                            alert("Vui lòng nhập ít nhất một từ vựng hợp lệ.");
                            return;
                        }

                        onSave(filteredRows);
                        onClose();
                    }}
                    variant="contained"
                >
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog >
    );
};

export default BatchFlashcardModal;
