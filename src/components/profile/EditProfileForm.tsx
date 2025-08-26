import { Button, TextField, Avatar } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { useState, useEffect } from "react";
import userService from "../../services/user.service";
import { useDispatch } from "react-redux";
import { updateUser } from "../../stores/userSlice";

interface EditProfileFormProps {
  initialName: string;
  initialGmail: string;
  avatarUrl: string;
  onClose: () => void; // callback đóng form
  onAvatarChange: (newAvatar: string) => void; // callback cập nhật avatar cho UserCard
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialName,
  initialGmail,
  avatarUrl,
  onClose,
  onAvatarChange,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ name: initialName, gmail: initialGmail });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setFormData({ name: initialName, gmail: initialGmail });
    setAvatar(avatarUrl);
  }, [initialName, initialGmail, avatarUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setAvatar(result);
          onAvatarChange(result); // cập nhật ngay cho UserCard
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateUserProfile({
        fullname: formData.name,
        email: formData.gmail,
        avatar,
      });
      setLoading(false);

      dispatch(updateUser({
        name: updatedUser.fullname,
        gmail: updatedUser.email,
        avatarUrl: updatedUser.avatar,
      }));

      onClose();
    } catch (err) {
      console.error("Update profile failed:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Avatar với hover overlay */}
      <div
        className="relative mb-4"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ width: 80, height: 80 }}
      >
        <Avatar
          src={avatar}
          sx={{ width: 80, height: 80, cursor: "pointer" }}
          onClick={handleAvatarClick}
        />
        {hover && (
          <div
            onClick={handleAvatarClick}
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", cursor: "pointer" }}
          >
            <CameraAlt style={{ color: "white" }} />
          </div>
        )}
      </div>

      <TextField
        name="name"
        value={formData.name}
        onChange={handleChange}
        variant="standard"
        sx={{ mb: 1, fontSize: "1.25rem", fontWeight: "bold" }}
      />
      <TextField
        name="gmail"
        value={formData.gmail}
        onChange={handleChange}
        variant="standard"
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        size="small"
        className="mt-3 rounded-full px-5 normal-case"
        color="primary"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Đang lưu..." : "Lưu"}
      </Button>
    </div>
  );
};

export default EditProfileForm;
