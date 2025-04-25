import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import Driver from "../../images/Male.png";
import "./index.css";

const SuperAdminDetails = () => {
    const navigate = useNavigate(); // Use useNavigate instead of useHistory
    const [pageStatus, setPageStatus] = useState("HQList");
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
        // navigate("/manager-edit");
    }

    const handleSave = () => {
        navigate("/manager-edit");
    }

    const handleBack = () => {
        sessionStorage.getItem("UserRole") === "Admin" ? navigate("/super-admin") : navigate("/manager");
    }
    const handleHQ = (title) => {
        setPageStatus(title);
    }
    // const handleSort = (key) => {
    //     let direction = "asc";
    //     if (sortConfig.key === key && sortConfig.direction === "asc") {
    //         direction = "desc";
    //     }
    //     setSortConfig({ key, direction });
    // };
    const HQContent = ({ title }) => {
        return (
            <div>
                <div className="flex ">
                    <h5 className="mb-0">{title}</h5>
                    <button className="justify-between rounded-lg ml-1 flex items-center custom-blue-button border-none" onClick={addNew}>
                        <span>Add New</span>
                    </button>
                </div>
                <div className="flex mt-4 items-center">
                    <div>
                        <p className="mb-0">Look For</p>
                    </div>
                    <div className="flex justify-between w-10 ml-1">
                        <select className="custom-input rounded-lg cursor-pointer">
                            <option>Hqid</option>
                        </select>
                    </div>

                    <div className="ml-1">
                        <p className="mb-0">Look For</p>
                    </div>
                    <div className="flex justify-between w-10 ml-1">
                        <select className="custom-input rounded-lg cursor-pointer">
                            <option>Hqid</option>
                        </select>
                    </div>
                    <div className="ml-1">
                        <input type="" className="custom-input rounded-lg w-100 " />
                    </div>
                    <div className="ml-1 flex">
                        <div>
                            <button className="justify-between rounded-lg flex items-center w-30 custom-search-button border-none">
                                <span>Search</span>
                            </button>
                        </div>
                        <div>
                            <button className="justify-between rounded-lg ml-1 flex items-center custom-reset-button">
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </div>
                <table className="table-auto w-full mt-4 border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 cursor-pointer">
                            <th className="px-4 py-2 border" >ID</th>
                            <th className="px-4 py-2 border" >Name</th>
                            <th className="px-4 py-2 border">Experience</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDrivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{driver.id}</td>
                                <td className="px-4 py-2 border">{driver.name}</td>
                                <td className="px-4 py-2 border">{driver.experience}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination-container justify-start">
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
        )
    }
    return (
        <div className="p-6 w-full">
            <HeaderContainer />
            {/* Top Section */}
            <div className="items-center mt-5">
                <div onClick={handleBack} className="flex cursor-pointer justify-between items-center w-20 back-button">
                    <FaArrowLeft />
                    <span>Back</span>
                </div>
                <p className="pt-4 font-semibold text-lg">SAFE SUPER ADMIN</p>
                <div className="w-100 mt-4 flex justify-between rounded-lg">
                    <div className="w-40 rounded-lg admin-left-navbar">
                        <div className="left-navbar-header rounded-lg">
                            <span>Admin</span>
                        </div>
                        <div className="p-10">
                            <div onClick={()=>handleHQ("HQList")} className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span >Headquarters</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div onClick={()=>handleHQ("CompaniesList")} className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Companies</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>HQ Companies</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Credential Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Infraction Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Location Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Note Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Statuses Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Transportation Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Vehicle Log Types</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Vehicle Statuses</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>

                        </div>
                        <div className="left-navbar-subheader">
                            <span>Client</span>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Client List</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                        <div className="left-navbar-subheader">
                            <span>Drivers</span>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Lists</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Credentials</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Infractions</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Medical</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Driver Notes</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                        <div className="left-navbar-subheader">
                            <span>Locations</span>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Location List</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                        <div className="left-navbar-subheader">
                            <span>Schedule</span>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Lists</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Notes</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Schedule Import</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                        <div className="left-navbar-subheader">
                            <span>Vehicles</span>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Vehicle Lists</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                            <div className="flex justify-between mb-4 cursor-pointer hover-row">
                                <div className="hover-text">
                                    <span>Vehicle Logs</span>
                                </div>
                                <div className="hover-text">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-right-container">
                        {pageStatus === "HQList" && <HQContent title="HQ List" />}
                        {pageStatus === "CompaniesList" && <HQContent title="Companies List" />}
                    </div>
                    {/* <div className="flex justify-between mt-4 save-button">
                        <div onClick={handleSave} className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button">
                            <span>Edit</span>
                        </div>
                        <div>
                            <div className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button">
                                <span>Cancel</span>
                            </div>
                        </div>
                    </div> */}

                </div>
            </div>

        </div >
    );
};

export default SuperAdminDetails;
