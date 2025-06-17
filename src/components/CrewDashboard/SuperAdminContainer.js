import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
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
import dayjs from "dayjs";

import HeaderContainer from "./HeaderContainer";
import Driver from "../../images/Male.png";
import Map from "../../images/map.png";
import Vehicle from "../../images/vehicle.svg";
import DriverLicense from "../../images/california-license.png";
import { supabase } from "../../supabaseClient";

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
import AdminHeaderContainer from "./AdminHeaderContainer";

const safetyArr = [
  { label: "Clean", key: "clean" },
  { label: "Fluids", key: "fluids" },
  { label: "Oil", key: "oil" },
  { label: "Lights", key: "lights" },
  { label: "Wipers", key: "wipers" },
  { label: "Tires", key: "tires" },
];

const SuperAdminContainer = () => {
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
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const pullSchedules = async () => {
      const { data, count, error } = await supabase
        .from("Schedule")
        .select(
          `
            ScheduleID,
            ScheduleDate,
            FlightNo,
            Airline:AirlineID (AirlineLetterCode),
            ScheduleStatus:ScheduleStatusID (Code),
            TransportationType:TransportationTypeID (Code),
            Driver:DriverID (DriverCode),
            Vehicle:VehicleID (Code),
            Pickups:SchedulePickups (
              Passengers, 
              Location:LocationID (Code)
            ),
            Dropoffs:ScheduleDropoffs (
              Location:LocationID (Code)
            )
          `
        )
        .order("ScheduleDate", { ascending: false })
        .range(0, 9); // 0-9 for 10 records
      return { data, count, error };
    };
    try {
      pullSchedules().then(({ data, count, error }) => {
        if (error) throw error;
        const scheduleList = data.map((_item) => ({
          ScheduleID: _item.ScheduleID,
          ScheduleDate: dayjs(_item.ScheduleDate).format("YYYY-MM-DD"),
          Airline: _item.Airline.AirlineLetterCode,
          FlightNo: _item.FlightNo,
          Status: _item.ScheduleStatus.Code,
          Transport: _item.TransportationType.Code,
          Driver: _item.Driver.DriverCode,
          Vehicle: _item.Vehicle.Code,
          Pilots: 0,
          FA: 0,
          Pass: _item.Pickups[0]?.Passengers ?? 0,
          PU: _item.Pickups[0]?.Location?.Code ?? "",
          DO: _item.Dropoffs[0]?.Location?.Code ?? "",
        }));

        setSchedules(scheduleList);
      });
    } catch (err) {
      console.log("______", err);
    }
  }, []);

  const toggleSafetyCheck = useCallback((key) => {
    setSafetyCheck((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen((old) => !old);
  }, []);

  const toggleCheckbox = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const onManagerDetail = useCallback(() => {
    navigate("/manager-detail");
  }, [navigate]);
  const onSuperAdmin = useCallback(() => {
    navigate("/safe-super-admin");
  }, [navigate]);

  const handleReport = useCallback(() => {
    navigate("/reports");
  }, [navigate]);
  const handleFlightStatus = useCallback(() => {
    navigate("/flight-status");
  }, [navigate]);
  const handleScheduleChange = useCallback(() => {
    navigate("/schedule-change");
  }, [navigate]);
  const handleAddNote = useCallback(() => {
    navigate("/add-note");
  }, [navigate]);
  const handleAdminLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);
  const handleAddAirline = useCallback(() => {
    navigate("/airline-add");
  }, [navigate]);
  const handleAssignRide = useCallback(() => {
    setIsAssignRideModalOpen(!isAssignRideModalOpen);
  }, [navigate]);
  const handleImport = useCallback(() => {
    navigate("/import-data");
  }, [navigate]);
  const handleCharts = useCallback(() => {
    navigate("/charts");
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 w-full pr-6 pl-6">
        {/* Header */}
        <AdminHeaderContainer />

        {/* Flight Details */}
        <div className="flex justify-between grid grid-cols-3 gap-4 text-center border-b pb-4 flight-details-container">
          <div className="col-span-3 col-span-3-layout mb-4">
            <p className="text-xl font-semibold">Quick Overview</p>
            <div
              onClick={onManagerDetail}
              className="justify-between p-3 rounded-lg flex items-center more-detail-button"
            >
              <div>
                <span>All Managers</span>
              </div>
              <div>
                <FaArrowRight />
              </div>
              {/* <button className="mt-3 flex items-center space-x-2 text-blue-600">
                            </button> */}
            </div>
            <div
              onClick={onSuperAdmin}
              className="justify-between p-3 mt-4 rounded-lg flex items-center more-detail-button"
            >
              <div>
                <span>SAFE Super Admin</span>
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
                        setSelectedRows(schedules.map((row) => row.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    checked={selectedRows.length === schedules.length}
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
              {schedules.map((row) => (
                <tr key={row.ScheduleID} className="p-10">
                  <td className="p-10">
                    <MDBCheckbox
                      onChange={() => toggleCheckbox(row.ScheduleID)}
                      checked={selectedRows.includes(row.ScheduleID)}
                    />
                  </td>
                  <td className="p-10">{row.ScheduleID}</td>
                  <td className="p-10">{row.ScheduleDate}</td>
                  <td className="p-10">{row.Airline}</td>
                  <td className="p-10">{row.FlightNo}</td>
                  <td className="p-10">{row.Status}</td>
                  <td className="p-10">{row.Transport}</td>
                  <td className="p-10">{row.Driver}</td>
                  <td className="p-10">{row.Vehicle}</td>
                  <td className="p-10">{row.Pilots}</td>
                  <td className="p-10">{row.FA}</td>
                  <td className="p-10">{row.Pass}</td>
                  <td className="p-10">{row.PU}</td>
                  <td className="p-10">{row.DO}</td>
                  <td
                    onClick={toggleModal}
                    className="cursor-pointer flex justify-center"
                  >
                    <FaEdit />
                  </td>
                  <td className="p-10">{0}</td>

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

export default SuperAdminContainer;
