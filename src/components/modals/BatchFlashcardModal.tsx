import React, { useState, useCallback } from "react";
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
    id: number;
    word: string;
    definition: string;
    example1: string;
    example2: string;
    pronunciation: string;
    note: string;
}

interface BatchFlashcardModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (rows: FlashcardRow[]) => void;
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

const BatchFlashcardModal: React.FC<BatchFlashcardModalProps> = ({
    open,
    onClose,
    onSave
}) => {
    const [rows, setRows] = useState<FlashcardRow[]>([
        {
            id: 1,
            word: "Hello",
            definition: "Xin chào",
            example1: "Hello, how are you?",
            example2: "She said hello to me.",
            pronunciation: "/həˈləʊ/",
            note: "Basic greeting"
        },
        {
            id: 2,
            word: "Dog",
            definition: "Con chó",
            example1: "The dog is barking.",
            example2: "She has a big dog.",
            pronunciation: "/dɒɡ/",
            note: "Common animal"
        }
    ]);

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        rowId: number | null;
    } | null>(null);

    const columns: Column<FlashcardRow>[] = [
        { key: "id", name: "ID", width: 60, frozen: true },
        { key: "word", name: "Từ mới", renderEditCell: TextEditor },
        { key: "definition", name: "Định nghĩa", renderEditCell: TextEditor },
        { key: "example1", name: "Ví dụ 1", renderEditCell: TextEditor },
        { key: "example2", name: "Ví dụ 2", renderEditCell: TextEditor },
        { key: "pronunciation", name: "Phiên âm", renderEditCell: TextEditor },
        { key: "note", name: "Ghi chú", renderEditCell: TextEditor }
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
                    id: rows.length + 1,
                    word: "",
                    definition: "",
                    example1: "",
                    example2: "",
                    pronunciation: "",
                    note: ""
                };
                setRows([...rows, newRow]);
            }
        },
        [rows]
    );

    // Insert row (dịch id xuống)
    const insertRow = useCallback(
        (rowId: number, position: "above" | "below") => {
            const rowIdx = rows.findIndex(r => r.id === rowId);
            if (rowIdx === -1) return;

            const newRow: FlashcardRow = {
                id: 0,
                word: "",
                definition: "",
                example1: "",
                example2: "",
                pronunciation: "",
                note: ""
            };

            const newRows = [...rows];
            const insertIndex = position === "above" ? rowIdx : rowIdx + 1;
            newRows.splice(insertIndex, 0, newRow);

            // normalize id
            const normalized = newRows.map((r, i) => ({ ...r, id: i + 1 }));
            setRows(normalized);
            setContextMenu(null);
        },
        [rows]
    );

    const deleteRow = useCallback(
        (rowId: number) => {
            const rowIdx = rows.findIndex(r => r.id === rowId);
            if (rowIdx === -1) return;

            const newRows = rows.filter((r) => r.id !== rowId)
                .map((r, i) => ({ ...r, id: i + 1 }));
            setRows(newRows);
            setContextMenu(null);
        },
        [rows]
    );



    const handleCloseMenu = () => setContextMenu(null);

    const handleCellContextMenu = useCallback((args: any, event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            rowId: args.row.id
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
                        rowKeyGetter={(row) => row.id}
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
                        onSave(rows);
                        onClose();
                    }}
                    variant="contained"
                >
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BatchFlashcardModal;
