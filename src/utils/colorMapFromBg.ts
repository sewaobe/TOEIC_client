import { 
    MenuBook as BookIcon, 
    Business as BriefcaseIcon, 
    Flight as PlaneIcon, 
    Coffee as CoffeeIcon, 
    Favorite as HeartIcon, 
    MusicNote as MusicIcon, 
    CameraAlt as CameraIcon, 
    Code as CodeIcon, 
    Restaurant as RestaurantIcon, 
    Sports as SportsIcon, 
    School as SchoolIcon, 
    Pets as PetsIcon, 
} from "@mui/icons-material"
export function mapBgToIconColor(bgColor: string): string {
  return bgColor
    .replace("bg-", "text-")   // bg-blue-50 -> text-blue-50
    .replace("-50", "-600")    // chuyển sắc độ nhạt sang đậm
}

export const availableIcons = [
    { name: "Book", icon: BookIcon, bgColor: "bg-blue-50" }, 
    { name: "Briefcase", icon: BriefcaseIcon, bgColor: "bg-indigo-50" }, 
    { name: "Plane", icon: PlaneIcon, bgColor: "bg-purple-50" }, 
    { name: "Coffee", icon: CoffeeIcon, bgColor: "bg-amber-50" }, 
    { name: "Heart", icon: HeartIcon, bgColor: "bg-rose-50" }, 
    { name: "Music", icon: MusicIcon, bgColor: "bg-pink-50" }, 
    { name: "Camera", icon: CameraIcon, bgColor: "bg-teal-50" }, 
    { name: "Code", icon: CodeIcon, bgColor: "bg-green-50" }, 
    { name: "Restaurant", icon: RestaurantIcon, bgColor: "bg-orange-50" }, 
    { name: "Sports", icon: SportsIcon, bgColor: "bg-cyan-50" }, 
    { name: "School", icon: SchoolIcon, bgColor: "bg-violet-50" }, 
    { name: "Pets", icon: PetsIcon, bgColor: "bg-emerald-50" },] 

export const getIconInfoByName = (iconName: string) => {
  const found = availableIcons.find((item) => item.name === iconName)
  return found || null
}


export const getIconComponentByName = (
  iconName: string
): { IconComponent: React.ElementType; bgColor: string } => {
  const found = availableIcons.find(
    (item) => item.name.toLowerCase() === iconName.toLowerCase()
  );

  if (found) {
    return {
      IconComponent: found.icon,
      bgColor: found.bgColor,
    };
  }

  // 🔹 Trường hợp không tìm thấy → fallback mặc định
  return {
    IconComponent: SchoolIcon,
    bgColor: "bg-gray-50",
  };
};
