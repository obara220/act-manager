import React, { useState } from "react";
import {
  FaInfoCircle,
  FaComments,
  FaEdit,
  FaArrowRight,
  FaTimes,
  FaWrench,
  FaPlusCircle,
  FaCarSide,
  FaTrash,
  FaFileImport,
  FaChartBar,
  FaUserShield,
  FaUndo,
  FaRedo,
  FaFileAlt,
} from "react-icons/fa";
import HeaderContainer from "./HeaderContainer";
import Driver from "../../images/Male.png";
import Map from "../../images/map.png";
import Vehicle from "../../images/vehicle.svg";
import DriverLicense from "../../images/california-license.png";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import "./index.css";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBRow,
  MDBInput,
  MDBCheckbox,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBIcon,
} from "mdb-react-ui-kit";

import "mdb-react-ui-kit/dist/css/mdb.min.css";

const CrewContainer = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignRideModalOpen, setIsAssignRideModalOpen] = useState(false);
  const [safetyCheck, setSafetyCheck] = useState({
    clean: true,
    fluids: true,
    oil: false,
    lights: false,
    wipers: false,
    tires: false,
  });
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleSafetyCheck = (key) => {
    setSafetyCheck((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const safetyArr = [
    { label: "Clean", key: "clean" },
    { label: "Fluids", key: "fluids" },
    { label: "Oil", key: "oil" },
    { label: "Lights", key: "lights" },
    { label: "Wipers", key: "wipers" },
    { label: "Tires", key: "tires" },
  ];

  const data = [
    {
      id: 1,
      schedule_title: "Schedule Date",
      schedule_date: "2025-01-01",
      airline_title: "Airline",
      airline_value: "WN",
      flight_no_title: "Flight No",
      flight_no_value: "1057",
      status_title: "Status",
      status_value: "On Duty",
      transport_title: "Transport",
      transport_value: "Arrival",
      driver_title: "Driver",
      driver_value: "0202",
      vehicle_title: "Vehicle",
      vehicle_value: "2100-CVG",
      pilots_title: "Pilots",
      pilots_value: "0",
      fa_title: "F/A",
      fa_value: "0",
      pass_title: "Pass",
      pass_value: "2",
      pu_title: "P/U",
      pu_value: "CVG",
      do_value: "Marriot Hotel at River Center",
      delay_value: "On Time",
    },

    // { id: 2, name: "Airline", age: "WN" },
    // { id: 3, name: "Flight No", age: "1057" },
    // { id: 4, name: "Status", age: "On Duty" },
    // { id: 4, name: "Transport", age: "Arrival" },
    // { id: 4, name: "Driver", age: "0202" },
    // { id: 4, name: "Vehicle", age: "2100-CVG" },
    // { id: 4, name: "Pilots", age: "0" },
    // { id: 4, name: "F/A", age: "0" },
    // { id: 4, name: "Pass", age: "2" },
    // { id: 4, name: "P/U", age: "CVG" },
    // { id: 4, name: "Edit", age: "Edit" },
    // { id: 4, name: "Delay", age: "On Time" },
  ];

  const toggleCheckbox = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const onDriverDetail = () => {
    navigate("/driver-detail");
  };

  const handleReport = () => {
    navigate("/reports");
  };
  const handleFlightStatus = () => {
    navigate("/flight-status");
  };
  const handleScheduleChange = () => {
    navigate("/schedule-change");
  };
  const handleAddNote = () => {
    navigate("/add-note");
  };
  const handleAdminLogin = () => {
    navigate("/login");
  };
  const handleAddAirline = () => {
    navigate("/airline-add");
  };
  const handleAssignRide = () => {
    setIsAssignRideModalOpen(!isAssignRideModalOpen);
  };
  const handleImport = () => {
    navigate("/import-data");
  };
  const handleCharts = () => {
    navigate("/charts");
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 w-full pr-6 pl-6">
        {/* Header */}
        <HeaderContainer headerStyle="100px" />

        {/* Flight Details */}
        <div className="flex justify-between grid grid-cols-3 gap-4 text-center border-b pb-4 flight-details-container">
          <div className="col-span-3 col-span-3-layout mb-4">
            <p className="text-xl font-semibold">Quick Overview</p>
            <div
              onClick={onDriverDetail}
              className="justify-between p-4 rounded-lg flex items-center more-detail-button"
            >
              <div>
                <span>Your Drivers Details</span>
              </div>
              <div>
                <FaArrowRight />
              </div>
              {/* <button className="mt-3 flex items-center space-x-2 text-blue-600">
                            </button> */}
            </div>
          </div>
          <div className="flex w-50 mb-4">
            <div className="w-50 departure-custom-card rounded-lg">
              <p className="text-gray-500">Active drivers</p>
              <p className="text-lg font-semibold">25</p>
            </div>
            <div className="departure-custom-card rounded-lg">
              <p className="text-gray-500">Assigned rides</p>
              <p className="text-lg font-semibold">19</p>
            </div>
            <div className="w-50 departure-custom-card rounded-lg">
              <p className="text-gray-500">Available vehicles</p>
              <p className="text-lg font-semibold">6</p>
            </div>
          </div>
        </div>

        {/* Live Driver Update */}
        <div className="driver-content m-4">
          <div className="driver-container mr-4">
            <p className="text-location">Driver Roster & Assignment Overview</p>

            <p>
              Easily oversee and manage your fleet with real-time driver
              statuses, assigned vehicles, and upcoming trips. Track current
              locations, update driver profiles, assign vehicles, and ensure
              compliance with safety and documentation requirements—all in one
              streamlined dashboard.
            </p>
          </div>
          <div className="w-50 departure-custom-card rounded-lg">
            <div className="flex justify-between mb-2">
              <div>
                <p>Flight No</p>
              </div>
              <div>
                <input type="number" className="custom-input rounded-lg" />
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Schedule Date</p>
              </div>
              <div>
                <input type="date" className="custom-input rounded-lg" />
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Company</p>
              </div>
              <div>
                <select className="custom-input rounded-lg">
                  <option>Air Crew Transport</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Cient</p>
              </div>
              <div>
                <select className="custom-input rounded-lg">
                  <option>American Airlines</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Airport</p>
              </div>
              <div>
                <select className="custom-input rounded-lg">
                  <option>BUR</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>{/* <p>Airport</p> */}</div>
              <div>
                {/* <select className="custom-input rounded-lg"> 
                                    <option>BUR</option>
                                </select> */}
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div className="justify-between p-2 pr-20 pl-20 rounded-lg flex items-center custom-button">
                <span>Search</span>
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
          <div className="w-50 departure-custom-card rounded-lg">
            <div className="flex justify-between mb-2">
              <div>
                <p>Passengers</p>
              </div>
              <div>
                <input type="number" className="custom-input rounded-lg" />
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Date</p>
              </div>
              <div>
                <input type="date" className="custom-input rounded-lg" />
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Time</p>
              </div>
              <div>
                <select className="custom-input rounded-lg">
                  <option>Air Crew Transport</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Driver</p>
              </div>
              <div>
                <select className="custom-input rounded-lg">
                  <option>0001-Taxi Run</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p>Vehicle</p>
              </div>
              <div>
                <select className="custom-input rounded-lg">
                  <option>1102-KIA SEDONA</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>{/* <p>Airport</p> */}</div>
              <div>
                {/* <select className="custom-input rounded-lg"> 
                                    <option>BUR</option>
                                </select> */}
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div className="justify-between p-2 pr-20 pl-20 rounded-lg flex items-center custom-button">
                <span>Search</span>
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

        <div className="manger-button-groups-container p-2 rounded-lg mb-4 justify-between">
          <div className="flex align-center cursor-pointer">
            <FaWrench />
            <p className="mb-0 pl-10">Repair</p>
          </div>

          <div
            onClick={handleAddAirline}
            className="flex align-center cursor-pointer pl-10"
          >
            <FaPlusCircle />
            <p className="mb-0 pl-10">Add</p>
          </div>

          <div
            onClick={handleAssignRide}
            className="flex align-center cursor-pointer pl-10"
          >
            <FaCarSide />
            <p className="mb-0 pl-10">Assign Ride</p>
          </div>

          <div className="flex align-center cursor-pointer pl-10">
            <FaTrash />
            <p className="mb-0 pl-10">Delete</p>
          </div>

          <div
            onClick={handleImport}
            className="flex align-center cursor-pointer pl-10"
          >
            <FaFileImport />
            <p className="mb-0 pl-10">Import</p>
          </div>

          <div
            onClick={handleCharts}
            className="flex align-center cursor-pointer pl-10"
          >
            <FaChartBar />
            <p className="mb-0 pl-10">Charts</p>
          </div>

          <div className="flex align-center cursor-pointer pl-10">
            <FaUserShield />
            <p className="mb-0 pl-10">Admin</p>
          </div>

          <div className="flex align-center cursor-pointer pl-10">
            <FaUndo />
            <p className="mb-0 pl-10">Undo</p>
          </div>

          <div
            onClick={handleReport}
            className="flex align-center cursor-pointer pl-10"
          >
            <FaFileAlt />
            <p className="mb-0 pl-10">Report</p>
          </div>

          <div className="flex align-center cursor-pointer pl-10">
            <FaRedo />
            <p className="mb-0 pl-10">Refresh</p>
          </div>
        </div>

        <div className="mt-4 mr-0 ml-0" id="schedule-table">
          <MDBTable striped bordered hover>
            <MDBTableHead>
              <tr>
                <th className="p-10">
                  <MDBCheckbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(data.map((row) => row.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    checked={selectedRows.length === data.length}
                  />
                </th>
                <th className="p-10 text-center">ID</th>
                <th className="p-10 text-center">Schedule Date</th>
                <th className="p-10 text-center">Airline</th>
                <th className="p-10 text-center">Flight No</th>
                <th className="p-10 text-center">Status</th>
                <th className="p-10 text-center">Transport</th>
                <th className="p-10 text-center">Driver</th>
                <th className="p-10 text-center">Vehicle</th>
                <th className="p-10 text-center">Pilots</th>
                <th className="p-10 text-center">F/A</th>
                <th className="p-10 text-center">Pass</th>
                <th className="p-10 text-center">P/U</th>
                <th className="p-10 text-center">D/O</th>
                <th className="p-10 text-center">Edit</th>
                <th className="p-10 text-center">Delay</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {data.map((row) => (
                <tr key={row.id} className="p-10">
                  <td className="p-10">
                    <MDBCheckbox
                      onChange={() => toggleCheckbox(row.id)}
                      checked={selectedRows.includes(row.id)}
                    />
                  </td>
                  <td className="p-10">{row.id}</td>
                  <td className="p-10">{row.schedule_date}</td>
                  <td className="p-10">{row.airline_value}</td>
                  <td className="p-10">{row.flight_no_value}</td>
                  <td className="p-10">{row.status_value}</td>
                  <td className="p-10">{row.transport_value}</td>
                  <td className="p-10">{row.driver_value}</td>
                  <td className="p-10">{row.vehicle_value}</td>
                  <td className="p-10">{row.pilots_value}</td>
                  <td className="p-10">{row.fa_value}</td>
                  <td className="p-10">{row.pass_value}</td>
                  <td className="p-10">{row.pu_value}</td>
                  <td className="p-10">{row.do_value}</td>
                  <td
                    onClick={toggleModal}
                    className="cursor-pointer flex justify-center"
                  >
                    <FaEdit />
                  </td>
                  <td className="p-10">{row.delay_value}</td>

                  {/* <td>{row.d}</td> */}
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </div>
        {/* Driver Info & Map Section */}
        {/* <div className="flex justify-between grid grid-cols-3 gap-6">
                    <div className="driver-info-content">
                        <div className="bg-gray-200 p-3 rounded-lg flex flex-col items-center mb-4" style={{ height: '249px' }}>
                            <img
                                src={Driver}
                                alt="Driver"
                                className="w-6 h-6 rounded-full mt-3"
                            />
                            <h2 className="font-semibold mt-4" style={{ fontSize: '28px' }}>Joseph Smith</h2>
                            <p className="text-sm text-gray-600 m-0">5+ Years Driving Experience</p>
                        </div>
                        <div onClick={toggleModal} className="bg-gray-200 justify-between  p-4 rounded-lg flex items-center mb-4 more-info-button">
                            <div>
                                <FaInfoCircle />
                            </div>
                            <div>
                                <span>More Info</span>
                            </div>
                            <div>
                                <FaArrowRight />
                            </div>
                 
                        </div>
                        <div className="bg-gray-200 flex justify-between p-4 rounded-lg flex items-center">
                            <div>
                                <FaComments />
                            </div>
                            <div>
                                <span>Chat with Joseph</span>
                            </div>
                            <div>
                                <FaArrowRight />
                            </div>
                         
                        </div>
                    </div>

                    <div className="col-span-1 col-span-1-layout flex justify-center items-center">
                        <img src={Map} alt="map" style={{ width: '100%', height: '100%' }} />
                    </div>

                    <div className="" style={{ width: '30%', border: '1px solid #383E5026', borderRadius: '0.5rem' }}>
                        <div className="p-4 card-border">
                            <div className="mb-3">
                                <p className="text-gray-500 text-sm">Destination</p>
                                <p className="font-semibold text-md">Hilton Los Angeles</p>
                            </div>
                        </div>
                        <div className="p-4 card-border">
                            <div className="mb-3">
                                <p className="text-gray-500 text-sm">Pickup Location</p>
                                <p className="font-semibold text-md">
                                    Terminal 4,
                                </p>
                                <p className="font-semibold text-md">
                                    Passenger Pickup Zone
                                </p>
                            </div>
                        </div>
                        <div className="p-4">
                            <div>
                                <p className="text-gray-500 text-sm">Estimated Drive Time</p>
                                <p className="font-semibold text-md">10 minutes</p>
                            </div>
                        </div>
                    </div>
                </div> */}
        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container h-auto w-50">
              <div className="modal-header mb-0">
                {/* <h2 className="text-xl font-semibold">Driver & Vehicle Information</h2> */}
                <button className="modal-close" onClick={toggleModal}>
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="grid justify-between grid-cols-2 gap-4">
                {/* <h1>Manage Flight Assignment</h1> */}
                <p className="text-lg font-semibold">
                  Manage Flight Assignment
                </p>
                <p className="text-gray-500">
                  Update flight details, adjust schedules, add notes, or make
                  edits as needed.
                </p>
                <div
                  onClick={handleFlightStatus}
                  className="bg-gray-200 cursor-pointer flex justify-between p-4 rounded-lg items-center mt-4 mb-4"
                >
                  <div>
                    <span>Flight Status</span>
                  </div>
                  <div>
                    <FaArrowRight />
                  </div>
                </div>
                <div
                  onClick={handleScheduleChange}
                  className="bg-gray-200 cursor-pointer flex justify-between p-4 rounded-lg items-center mt-4 mb-4"
                >
                  <div>
                    <span>Schedule Change</span>
                  </div>
                  <div>
                    <FaArrowRight />
                  </div>
                </div>

                <div
                  onClick={handleAddNote}
                  className="bg-gray-200 flex justify-between p-4 rounded-lg items-center mt-4 mb-4"
                >
                  <div>
                    <span>Add Note</span>
                  </div>
                  <div>
                    <FaArrowRight />
                  </div>
                </div>
                <div
                  onClick={handleAdminLogin}
                  className="bg-gray-200 flex justify-between p-4 rounded-lg items-center mt-4 mb-4"
                >
                  <div>
                    <span>Edit(Admin Login)</span>
                  </div>
                  <div>
                    <FaArrowRight />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAssignRideModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container h-auto w-50">
              <div className="modal-header mb-0">
                {/* <h2 className="text-xl font-semibold">Driver & Vehicle Information</h2> */}
                <button className="modal-close" onClick={handleAssignRide}>
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="grid justify-between grid-cols-2 gap-4">
                <p className="text-lg font-semibold">Assign a Ride</p>
                <div className="cursor-pointer flex justify-between pt-4 ">
                  <div>
                    <span>Driver</span>
                  </div>
                  <div>
                    <select className="custom-input rounded-lg">
                      <option>0001-Taxi Run</option>
                    </select>
                  </div>
                </div>
                <div className="cursor-pointer flex justify-between pt-4">
                  <div>
                    <span>Car</span>
                  </div>
                  <div>
                    <select className="custom-input rounded-lg">
                      <option>1102-KIA SEDONA P..</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between mt-4 save-button">
                  <div className="justify-center p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button">
                    <span>Assign</span>
                  </div>
                  <div className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button">
                    <span>Cancel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewContainer;
