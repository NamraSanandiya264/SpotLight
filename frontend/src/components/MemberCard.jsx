const MemberCard = ({ member }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow flex justify-between items-center">

      <div>
        <h3 className="font-semibold">
          {member.name}
        </h3>

        <p className="text-sm text-gray-500">
          ID : {member.studentID}
        </p>
      </div>

      <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">
        {member.role}
      </span>

    </div>
  );
};

export default MemberCard;