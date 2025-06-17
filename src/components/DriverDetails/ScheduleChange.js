import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { supabase } from "../../supabaseClient";

import Driver from "../../images/Male.png";
import "./index.css";

const ScheduleChange = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const dispatch = useDispatch(); // Initialize dispatch

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusId, setStatusId] = useState(1);
  const driversPerPage = 15; // 3 rows of 5 cards each
  const scheduleId = useSelector((state) => state.scheduleId);
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
  // const addNew = () => {
  //   navigate("/vehicle-assignment");
  // };

  const handleSave = async () => {
    try {
      console.log(statusId, "---here status id");
      // 2. Insert data into Supabase table
      if (scheduleId && statusId) {
        const { data: insertedDriver, error: insertError } = await supabase
          .from("ScheduleChanges")
          .insert([
            {
              ScheduleID: scheduleId,
              ScheduleStatusID: statusId,
            },
          ])
          .select();

        if (insertError) throw insertError;
        if (insertedDriver) {
          toast.success("Schedule Change saved successfully!");

          // const driverId = insertedDriver[0].DriverID; // or .id depending on your schema
          // dispatch({ type: "DRIVER_ID", payload: driverId });
          // Optional: Navigate to next screen
          // navigate("/driver-credentials");
        }
      }
    } catch (error) {
      console.error("Error saving driver:", error.message);
      toast.error("Failed to save driver. Check console for details.");
      // alert("Failed to save driver. Check console for details.");
    } finally {
      // setLoading(false); // stop loading
    }
    // navigate("/import-data");
  };
  const handleBack = () => {
    sessionStorage.getItem("UserRole") === "1"
      ? navigate("/super-admin")
      : navigate("/manager");
  };

  return (
    <div className="p-6 w-full">
      <HeaderContainer />
      <div className="items-center mt-5 personal-info-content">
        <div
          onClick={handleBack}
          className="flex justify-between cursor-pointer items-center w-20 back-button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </div>
        {/* Top Section */}
        <p className="font-semibold text-lg">Schedule Change</p>
        {/* <span>Easily upload driver, vehicle, and flight data in bulk. Ensure accuracy by using the provided template format.</span> */}
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex justify-content-end mb-2">
            <div className="justify-between w-50">
              <label style={{ display: "block" }}>
                <input
                  type="radio"
                  name="option"
                  value="1"
                  className="mr-1"
                  onChange={(e) => setStatusId(parseInt(e.target.value))}
                  checked={statusId === 1}
                />
                <span>Cancel Service</span>
              </label>
              <label style={{ display: "block" }}>
                <input
                  type="radio"
                  name="option"
                  value="2"
                  className="mr-1"
                  onChange={(e) => setStatusId(parseInt(e.target.value))}
                  checked={statusId === 2}
                />
                <span>Request Change</span>
              </label>
              <label style={{ display: "block" }}>
                <input
                  type="radio"
                  name="option"
                  value="3"
                  className="mr-1"
                  onChange={(e) => setStatusId(parseInt(e.target.value))}
                  checked={statusId === 3}
                />
                <span>Delayed Flight</span>
              </label>
              <label style={{ display: "block" }}>
                <input
                  type="radio"
                  name="option"
                  value="4"
                  className="mr-1"
                  onChange={(e) => setStatusId(parseInt(e.target.value))}
                  checked={statusId === 4}
                />
                <span>Completed</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-4 save-button">
            <div
              onClick={handleSave}
              className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button"
            >
              <span>Save</span>
            </div>
            <div>
              <div className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button">
                <span>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleChange;
