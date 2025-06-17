import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import Driver from "../../images/Male.png";
import "./index.css";

const FlightStatus = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const driversPerPage = 15; // 3 rows of 5 cards each

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
  const handleSave = () => {
    navigate("/import-data");
  };
  const handleBack = () => {
    sessionStorage.getItem("UserRole") === "1"
      ? navigate("/super-admin")
      : navigate("/manager");
  };
  return (
    <div className="p-6 w-full">
      <HeaderContainer />
      <div
        onClick={handleBack}
        className="flex justify-between items-center w-20 back-button"
      >
        <FaArrowLeft />
        <span>Back</span>
      </div>
      {/* Top Section */}
      <div className="items-center mt-5 personal-info-content">
        <p className="font-semibold text-lg">Flight Status</p>
        {/* <span>Easily upload driver, vehicle, and flight data in bulk. Ensure accuracy by using the provided template format.</span> */}
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <div>
              <p>Departure Airport</p>
            </div>
            <div className="flex justify-between w-35">
              <p>LAX (Los Angeles International Airport)</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Arrival Airport</p>
            </div>
            <div className="flex justify-between w-35">
              <p>JFK (John F. Kennedy International Airport)</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Carrier</p>
            </div>
            <div className="flex justify-between w-35">
              <p>American Airlines (AA 1256)</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Delay</p>
            </div>
            <div className="flex justify-between w-35">
              <p>15 minutes</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Gate Arrival</p>
            </div>
            <div className="flex justify-between w-35">
              <p>B12</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Departure Terminal</p>
            </div>
            <div className="flex justify-between w-35">
              <p>Terminal 4</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Departure Gate</p>
            </div>
            <div className="flex justify-between w-35">
              <p>D8</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Arrival Terminal</p>
            </div>
            <div className="flex justify-between w-35">
              <p>Terminal 5</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Arrival Gate</p>
            </div>
            <div className="flex justify-between w-35">
              <p>A6</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Baggage</p>
            </div>
            <div className="flex justify-between w-35">
              <p>Carousel 3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightStatus;
