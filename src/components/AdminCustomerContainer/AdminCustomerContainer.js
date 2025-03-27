// import logo from "./logo.svg";
// import AdminContainer from "../Admin/AdminContainer";
// import CustomerContainer from "../CustomerContainer/CustomerContainer";

// function AdminCustomerContainer(props) {
//     return (
//         <> {props?.isAdmin ? (
//             <AdminContainer {...props} />
//         ) : (
//             <CustomerContainer {...props} />
//         )}
//         </>
//     );
// }

// export default AdminCustomerContainer;

import React from "react";
import { FaInfoCircle, FaComments } from "react-icons/fa";

const AdminCustomerContainer = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="ACT Logo" className="h-10" />
            <h1 className="text-lg font-semibold">
              Welcome, <span className="text-blue-600">Jhon Doe</span>
            </h1>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Flight..."
              className="border rounded-full px-4 py-2"
            />
          </div>
        </div>

        {/* Flight Details */}
        <div className="grid grid-cols-3 gap-4 text-center border-b pb-4">
          <div>
            <p className="text-gray-500">Flight Number</p>
            <p className="text-lg font-semibold">2251</p>
          </div>
          <div>
            <p className="text-gray-500">Departure Time</p>
            <p className="text-lg font-semibold">3.15 PM</p>
          </div>
          <div>
            <p className="text-gray-500">Arrival Time</p>
            <p className="text-lg font-semibold">7.00 PM</p>
          </div>
        </div>

        {/* Live Driver Update */}
        <div className="text-center py-6">
          <p className="text-lg font-medium">
            Your driver is on the way and will arrive at your location in
            approximately <span className="text-blue-600 font-bold">5 minutes</span>.
          </p>
        </div>

        {/* Driver Info & Map Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Driver Info */}
          <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center">
            <img
              src="/driver.jpg"
              alt="Driver"
              className="w-20 h-20 rounded-full mb-2"
            />
            <h2 className="text-lg font-semibold">Joseph Smith</h2>
            <p className="text-sm text-gray-600">5+ Years Driving Experience</p>
            <button className="mt-3 flex items-center space-x-2 text-blue-600">
              <FaInfoCircle />
              <span>More Info</span>
            </button>
            <button className="mt-2 flex items-center space-x-2 text-blue-600">
              <FaComments />
              <span>Chat with Joseph</span>
            </button>
          </div>

          {/* Map Placeholder */}
          <div className="col-span-1 flex justify-center items-center bg-gray-300 rounded-lg">
            <p className="text-gray-700">[ Map Integration ]</p>
          </div>

          {/* Ride Details */}
          <div className="bg-gray-200 p-4 rounded-lg">
            <div className="mb-3">
              <p className="text-gray-500">Destination</p>
              <p className="font-semibold">Hilton Los Angeles</p>
            </div>
            <div className="mb-3">
              <p className="text-gray-500">Pickup Location</p>
              <p className="font-semibold">
                Terminal 4, Passenger Pickup Zone
              </p>
            </div>
            <div>
              <p className="text-gray-500">Estimated Drive Time</p>
              <p className="font-semibold">10 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerContainer;
