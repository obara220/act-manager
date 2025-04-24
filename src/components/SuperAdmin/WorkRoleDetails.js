import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft, } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import Driver from "../../images/Male.png";
import "./index.css";

const WorkRoleDetails = () => {
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
        navigate("/manager-login-credentials");
    }
    const handleBack = () => {
        navigate("/manager-work-role-details");
    }
    return (
        <div className="p-6 w-full">
            <HeaderContainer />
            {/* Top Section */}
            <div className="items-center mt-5 personal-info-content">
                <div onClick={handleBack} className="flex cursor-pointer justify-between items-center w-20 back-button">
                    <FaArrowLeft />
                    <span>Back</span>
                </div>
                <p className="pt-4 font-semibold text-lg">Work & Role Details</p>
                <span>Update Manager work details and role</span>
                <div className="w-100 mt-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Assigned Service Location</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="text" className="custom-input rounded-lg w-100" />
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Manager Role Level</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="date" className="custom-input rounded-lg w-100 " />
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Employee ID (If Applicable)</p>
                        </div>
                        <div className="flex justify-between w-35">

                            <select className="custom-input rounded-lg">
                                <option>Air Crew Transport</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>
                            <p>Years of Experience</p>
                        </div>
                        <div className="flex justify-between w-35">
                            <input type="number" className="custom-input rounded-lg w-100 " />
                        </div>
                    </div>

                    <div className="flex justify-between mt-4 save-button">
                        <div onClick={handleSave} className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button">
                            <span>Save and Continue</span>
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

export default WorkRoleDetails;
