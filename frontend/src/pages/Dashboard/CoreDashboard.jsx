// //sbg core - > CoreDashboard.jsx

// const CoreDashboard = () => {
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">SBG Core Dashboard</h2>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-white p-4 shadow rounded">
//           Total Bookings
//         </div>

//         <div className="bg-white p-4 shadow rounded">
//           Pending Approvals
//         </div>

//         <div className="bg-white p-4 shadow rounded">
//           Budget Overview
//         </div>
//       </div>

//       {/* Approval Table */}
//       <div className="mt-6 bg-white p-4 shadow rounded">
//         <h3 className="font-semibold mb-2">Booking Requests</h3>

//         <table className="w-full">
//           <thead>
//             <tr className="text-left border-b">
//               <th>Room</th>
//               <th>Date</th>
//               <th>User</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             <tr>
//               <td>Room A</td>
//               <td>12 Apr</td>
//               <td>John</td>
//               <td>
//                 <button className="bg-green-500 text-white px-2 py-1 mr-2 rounded">
//                   Approve
//                 </button>
//                 <button className="bg-red-500 text-white px-2 py-1 rounded">
//                   Reject
//                 </button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CoreDashboard;