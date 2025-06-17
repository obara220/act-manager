import React, { useState, useEffect } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Driver from "../../images/Male.png";
import "./index.css";

const VehicleAssignment = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [vehicles, setVehicles] = useState([]);
  // const [assignedVehicle, setAssignedVehicle] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const driversPerPage = 15; // 3 rows of 5 cards each
  const driverId = useSelector((state) => state.auth.driverId);
  const [assignedVehicle, setAssignedVehicle] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vinNum, setVinNum] = useState("");
  const [miles, setMiles] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");

  const drivers = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Driver ${i + 1}`,
    experience: `${
      Math.floor(Math.random() * 10) + 1
    } Years Driving Experience`,
  }));
  const totalPages = Math.ceil(drivers.length / driversPerPage);

  // Pagination Logic
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = drivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const addNew = () => {
    navigate("/vehicle-assignment");
  };
  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase.from("Vehicles").select("*");

      if (error) {
        console.error("Error fetching vehicles:", error.message);
      } else {
        setVehicles(data || []);
      }
    };

    fetchVehicles();
  }, []);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("Vehicles")
        .update({
          DriverId: driverId,
          // VehicleID: assignedVehicle,
          ExpireDate: insuranceExpiry,
          Miles: miles,
        })
        .eq("VehicleID", assignedVehicle);

      if (error) throw error;
      toast.success("Vehicle assignment saved successfully!");

      //   alert("Vehicle assignment saved successfully!");
      navigate("/manager");
    } catch (err) {
      console.error("Error saving vehicle assignment:", err.message);
      toast.error("Failed to save vehicle assignment.");
      //   alert("Failed to save vehicle assignment.");
    }
  };

  const handleBack = () => {
    navigate("/driver-credentials");
  };
  return (
    <div className="p-6 w-full">
      <HeaderContainer />
      {/* Top Section */}
      <div className="items-center mt-5 personal-info-content">
        <div
          onClick={handleBack}
          className="flex cursor-pointer justify-between items-center w-20 back-button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </div>
        <p className="pt-4 font-semibold text-lg">Vehicle Assignment</p>
        <span>Update driver's Vehicle Information properly.</span>
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <div>
              <p>Select Assigned Vehicle</p>
            </div>
            <div className="flex justify-between w-35">
              <select
                value={assignedVehicle}
                onChange={(e) => setAssignedVehicle(e.target.value)}
                className="custom-input w-100 rounded-lg"
              >
                <option value="">Select a Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.VehicleID} value={vehicle.VehicleID}>
                    {vehicle.Code} - {vehicle.PlateNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>Vehicle Type & Plate Number</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                className="custom-input w-100 rounded-lg"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. SUV - ABC1234"
              />
            </div>
          </div>
          {/* <div className="flex justify-between mb-2">
            <div>
              <p>Vin Number</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                className="custom-input w-100 rounded-lg"
                value={vinNum}
                onChange={(e) => setVinNum(e.target.value)}
                placeholder=""
              />
            </div>
          </div> */}
          <div className="flex justify-between mb-2">
            <div>
              <p>Miles</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                className="custom-input w-100 rounded-lg"
                value={miles}
                onChange={(e) => setMiles(e.target.value)}
                placeholder=""
              />
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Insurance Expiry Date</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="date"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                className="custom-input rounded-lg w-100 "
              />
            </div>
          </div>

          <div className="flex justify-between mt-4 save-button">
            <div
              onClick={handleSave}
              className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button"
            >
              <span>Save and Assign</span>
            </div>
            <div>
              {/* <select className="custom-input rounded-lg"> 
                                    <option>BUR</option>
                                </select> */}
              <div
                onClick={() => {
                  setAssignedVehicle("");
                  setVehicleType("");
                  setInsuranceExpiry("");
                  setMiles("");
                  setVinNum("");
                }}
                className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button"
              >
                <span>Clear</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleAssignment;
