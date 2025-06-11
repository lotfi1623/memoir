// components/StatCard.tsx
const StatCard = ({ title, value }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    );
  };
  
  export default StatCard;
  