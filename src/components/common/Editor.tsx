import { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SaveIcon from "@mui/icons-material/Save";
import { Button } from "@mui/material";

// Đăng ký module resize ảnh
const ImageResizeModule = (ImageResize as any).default || ImageResize;
Quill.register("modules/imageResize", ImageResizeModule);

// Đăng ký size whitelist
const Size = Quill.import("attributors/style/size");
Size.whitelist = ["10px", "12px", "14px", "16px", "18px", "24px", "32px"];
Quill.register(Size, true);

// Đăng ký font family
const Font = Quill.import("attributors/style/font");
Font.whitelist = ["arial", "times-new-roman", "roboto", "courier-new"];
Quill.register(Font, true);

// Custom toolbar
const CustomToolbar = () => (
    <div id="toolbar" className="flex items-center gap-2 flex-wrap">
        {/* Nhóm Select bên trái */}
        <div className="w-1/2 basis-full flex items-center gap-2">
            <select className="ql-header" defaultValue="" title="Tiêu đề">
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="">Normal</option>
            </select>

            {/* Font */}
            <div className="w-[150px]">
                <select
                    className="ql-font !w-full text-sm"
                    defaultValue="arial"
                    title="Phông chữ"
                >
                    <option value="arial">Arial</option>
                    <option value="times-new-roman">Times New Roman</option>
                    <option value="roboto">Roboto</option>
                    <option value="courier-new">Courier New</option>
                </select>
            </div>

            {/* Size */}
            <div className="w-14">
                <select
                    className="ql-size !w-full text-sm text-center"
                    defaultValue="16px"
                    title="Kích cỡ chữ"
                >
                    <option value="12px">12</option>
                    <option value="14px">14</option>
                    <option value="16px">16</option>
                    <option value="18px">18</option>
                    <option value="24px">24</option>
                    <option value="32px">32</option>
                </select>
            </div>
        </div>

        {/* Nhóm Button bên phải */}
        <div className="w-full flex items-center gap-2 flex-wrap">
            <button className="ql-bold" title="In đậm"></button>
            <button className="ql-italic" title="In nghiêng"></button>
            <button className="ql-underline" title="Gạch chân"></button>
            <button className="ql-strike" title="Gạch ngang"></button>

            <button className="ql-list" value="ordered" title="Danh sách số"></button>
            <button className="ql-list" value="bullet" title="Danh sách gạch đầu dòng"></button>

            <select className="ql-color" title="Màu chữ"></select>
            <select className="ql-background" title="Màu nền"></select>

            <button className="ql-link" title="Chèn liên kết"></button>
            <button className="ql-image" title="Chèn ảnh"></button>

            <button className="ql-clean" title="Xóa định dạng"></button>
        </div>
    </div>
);

export default function Editor({
    initialValue = "",
    onSave,
}: {
    initialValue?: string;
    onSave?: (value: string) => void;
}) {
    const [value, setValue] = useState(initialValue);
    const quillRef = useRef<ReactQuill>(null);
    // update khi prop initialValue đổi
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const modules = {
        toolbar: {
            container: "#toolbar", // dùng custom toolbar
        },
        imageResize: {
            parchment: Quill.import("parchment"),
            modules: ["Resize", "DisplaySize", "Toolbar"],
        },
    };

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "color",
        "background",
        "link",
        "image",
    ];

    useEffect(() => {
        const el = document.querySelector(".ql-editor");
        if (el) {
            el.setAttribute("spellcheck", "false");
            el.setAttribute("lang", "vi");
        }
    }, []);

    // Load content đã lưu
    useEffect(() => {
        const saved = localStorage.getItem("editorContent");
        if (saved) {
            setValue(saved);
        }
        const el = document.querySelector(".ql-editor");
        if (el) {
            el.setAttribute("spellcheck", "false");
            el.setAttribute("lang", "vi");
        }
    }, []);

    // Hàm lưu
    const handleSave = () => {
        localStorage.setItem("editorContent", value);
        if (onSave) onSave(value);
        alert("✅ Nội dung đã được lưu!");
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <EditNoteIcon className="!w-7 !h-7 text-blue-600" />
                <span className="text-gray-800">Tóm tắt nội dung bài học</span>
            </h2> */}

            {/* Toolbar tuỳ chỉnh */}
            <CustomToolbar />

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
                placeholder="Viết tóm tắt tại đây..."
                className="bg-white rounded-xl [&_.ql-editor]:[spellcheck=false]"
            />

            {/* Nút lưu */}
            <div className="mt-4 flex justify-end">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Lưu
                </Button>
            </div>

            {/* <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2">📄 Preview</h3>
                <div dangerouslySetInnerHTML={{ __html: value }} />
            </div> */}
        </div>
    );
}
