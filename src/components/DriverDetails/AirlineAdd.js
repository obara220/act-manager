import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft, } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import Driver from "../../images/Male.png";
import "./index.css";

const AirlineAdd = () => {
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
        navigate("/vehicle-assignment");
    }
    const handleSave = () => {
        navigate("/import-data");
    }
    const handleBack = () => {
        navigate("/manager");
    }
    return (
        <div className="p-6 w-full">
            <HeaderContainer />
            {/* Top Section */}
            <div className="items-center mt-5 personal-info-content">
                <div onClick={handleBack} className="flex justify-between cursor-pointer items-center w-20 back-button">
                    <FaArrowLeft />
                    <span>Back</span>
                </div>
                <p className="pt-4 font-semibold text-lg">Airline Add</p>
                <span>Add a driver, assign company flights, and update details here</span>
                <div className="w-100 mt-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Company</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>Air Crew Transport, Inc</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Client</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>ABX Air</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Transportation Type</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>Air Crew Transport</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>P/U</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>AA Training Center</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>D/O</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>AA Training Center</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Date</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="date" className="custom-input rounded-lg w-100 " />
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Time</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="date" className="custom-input rounded-lg w-100 " />
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Flight</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>Alaska Airlines</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Rate</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>Rate Now</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Driver</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>0001-TAXI RUN</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Vehicle</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <select className="custom-input w-100 rounded-lg">
                                <option>1002-FORD TRANSIT LAX</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Pilots</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="text" className="custom-input rounded-lg w-100" />
                        </div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div>
                            <p>F/A</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="number" className="custom-input rounded-lg w-100" />
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Passengers</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="number" className="custom-input rounded-lg w-100" />
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Note to Driver</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <textarea type="text" className="custom-input rounded-lg w-100" />
                        </div>
                    </div>

                    <div className="flex justify-between mt-4 save-button">
                        <div onClick={handleSave} className="justify-center p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button">
                            <span>Save</span>
                        </div>
                        <div>
                            {/* <select className="custom-input rounded-lg"> 
                                    <option>BUR</option>
                                </select> */}
                            <div className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button">
                                <span>Clear</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div >
    );
};

export default AirlineAdd;
