import { MdSupervisedUserCircle } from "react-icons/md";

const Card = ({ title, count, icon }) => {
  const Icon = icon || MdSupervisedUserCircle;
  return (
    <div className="dark:border-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-5 rounded-lg flex items-center gap-5 cursor-pointer hover:bg-gray-100 transition-colors w-full border border-gray-200 shadow-sm">
      <Icon size={24} className="text-green-600" />
      <div className="flex flex-col gap-2">
        <span className="text-green-600">{title}</span>
        <span className="text-2xl font-medium text-green-600">{count}</span>
      </div>
    </div>
  );
};

export default Card;
