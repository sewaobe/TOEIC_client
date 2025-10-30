import { Link } from "react-router-dom";

interface HeaderProps {
  testTitle: string;
}

const Header: React.FC<HeaderProps> = ({ testTitle }) => {

  return (
    <div className='flex items-center justify-between mb-4'>
      <nav className='text-sm text-gray-500'>
        <Link to="/tests" style={{ color: "blue" }}>Trang chủ</Link> / {testTitle}
      </nav>
    </div>
  );
};

export default Header;
