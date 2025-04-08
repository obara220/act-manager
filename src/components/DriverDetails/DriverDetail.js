import React, { useState } from "react";
import { FaInfoCircle, FaArrowRight, FaSearch, FaArrowLeft, } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Driver from "../../images/Male.png";
import "./index.css";

const DriverDetail = () => {
    const navigate = useNavigate(); // Use useNavigate instead of useHistory

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const driversPerPage = 15; // 3 rows of 5 cards each

    const drivers = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Driver ${i + 1}`,
        experience: `${Math.floor(Math.random() * 10) + 1} Years Driving Experience`,
    }));
    const totalPages = Math.ceil(drivers.length / driversPerPage);

    // Pagination Logic
    const indexOfLastDriver = currentPage * driversPerPage;
    const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
    const currentDrivers = drivers.slice(indexOfFirstDriver, indexOfLastDriver);
    const addNew = () => {
        navigate("/driver-new");
    }
    return (
        <div className="p-6 w-full">
            <HeaderContainer />
            {/* Top Section */}
            <div className="flex justify-between items-center mt-4">
                <p className="font-semibold text-lg">All Drivers [{drivers.length}]</p>

                <div className="flex items-center space-x-4">
                    {/* Search Input */}
                    <div className="search-input-wrapper">
                        <div className="search-input-container">
                            <input
                                type="text"
                                placeholder="Search Flight..."
                                className="search-input"
                            />
                            <FaSearch className="search-icon" />
                        </div>
                    </div>

                    {/* Add New Button */}
                    {/* <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                        Add New
                    </button> */}
                    <div onClick={addNew} className="justify-between p-2 pr-20 pl-20 rounded-lg flex items-center custom-button m-2">
                        <span>Add New</span>
                    </div>

                    {/* Dropdown */}
                    <select className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none ml-1">
                        <option>Air Crew Transport</option>
                    </select>
                </div>
            </div>

            {/* Driver Info Grid */}

            {/* Pagination Controls */}
            <div>
                {/* Driver Cards Grid */}
                <div className="driver-grid">
                    {currentDrivers.map((driver) => (
                        <div>
                            <div key={driver.id} className="driver-card">
                                <div>
                                    <img src={Driver} alt="Driver" className="driver-img" />
                                    <h2 className="driver-name">{driver.name}</h2>
                                    <p className="driver-experience">{driver.experience}</p>
                                </div>

                                {/* More Info Button */}
                                < div className="more-info-button" >
                                    <span>More Info</span>
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="pagination-container">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        <FaArrowLeft className="pagination-icon" />
                    </button>

                    {Array.from({ length: Math.ceil(drivers.length / driversPerPage) }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(drivers.length / driversPerPage)))}
                        disabled={indexOfLastDriver >= drivers.length}
                        className="pagination-button"
                    >
                        <FaArrowRight className="pagination-icon" />
                    </button>
                </div>
            </div>
        </div >
    );
};

export default DriverDetail;
