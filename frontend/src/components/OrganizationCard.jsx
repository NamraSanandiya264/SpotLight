import { useNavigate } from "react-router-dom";

const OrganizationCard = ({ org }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/organizations/${org._id}`)}
    >
      <img
        src={
          org.photos?.[0] ||
          "https://via.placeholder.com/300x150"
        }
        alt={org.name}
        className="w-full h-40 object-cover rounded-lg"
      />

      <div className="mt-3">
        <h2 className="font-bold text-lg">
          {org.name}
        </h2>

        <span className="text-sm text-gray-500">
          {org.type}
        </span>

        <p className="text-sm mt-2 text-gray-600 line-clamp-2">
          {org.description}
        </p>
      </div>
    </div>
  );
};

export default OrganizationCard;