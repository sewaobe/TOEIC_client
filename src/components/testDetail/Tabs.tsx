interface TabsProps {
  activeTab: 'practice' | 'full';
  setActiveTab: (tab: 'practice' | 'full') => void;
  onDiscussionClick: () => void;
}

const Tabs: React.FC<TabsProps> = ({
  activeTab,
  setActiveTab,
  onDiscussionClick,
}) => {
  return (
    <div className='flex space-x-4 border-b mb-4'>
      <button
        type='button'
        onClick={() => setActiveTab('practice')}
        className={`py-2 px-4 font-semibold ${
          activeTab === 'practice'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600'
        }`}
      >
        Luyện tập
      </button>

      <button
        type='button'
        onClick={() => setActiveTab('full')}
        className={`py-2 px-4 font-semibold ${
          activeTab === 'full'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600'
        }`}
      >
        Làm full test
      </button>

      <button
        type='button'
        onClick={onDiscussionClick}
        className='py-2 px-4 text-gray-600 font-semibold'
      >
        Thảo luận
      </button>
    </div>
  );
};

export default Tabs;
