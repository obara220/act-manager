import React, { useCallback, useState } from "react";
import {
  FaInfoCircle,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import Driver from "../../images/Male.png";
import "./index.css";

import { supabase } from "../../supabaseClient";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const SuperAdminDetails = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const [fileName, setFileName] = useState();
  const [jsonList, setJsonList] = useState([]);

  const [isProcessingCSV, setProcessingCSV] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setProcessingCSV(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const worksheetName = workbook.SheetNames[1] ?? workbook.SheetNames[0];
        if (!worksheetName) return;
        const rawJsonData = XLSX.utils
          .sheet_to_json(workbook.Sheets[worksheetName], {
            header: 18,
          })
          .filter((_item, index) => index > 8 && !!_item.__EMPTY_7);
        const jsonData = [];
        const errorData = [];
        let curDate = rawJsonData[0]["__EMPTY_2"];

        for (let i = 0; i < rawJsonData.length; i++) {
          const _item = rawJsonData[i];
          if (_item["__EMPTY_2"]) curDate = _item["__EMPTY_2"];
          const pickupTime = _item["__EMPTY_24"];

          const scheduleDate = dayjs(
            `${curDate} ${pickupTime.split(" ")[2]}`,
            "DD-MMM-YYYY HH:mm"
          );
          const passenger = _item["__EMPTY_10"];
          const airport = _item["__EMPTY_12"];
          const pickup = _item["__EMPTY_14"];
          const dropoff = _item["__EMPTY_32"];
          const newItem = {
            scheduleDate,
            passenger,
            airport,
            pickup,
            dropoff,
          };
          if (!passValidation(newItem)) errorData.push(Object.values(_item));
          jsonData.push(newItem);
        }
        setFileName(acceptedFiles[0].name);
        setJsonList(jsonData);
        setErrorList(errorData);
      } catch (_err) {
        console.error("Error reading xls file", _err);
      }
      setProcessingCSV(false);
    };
    reader.onerror = () => {
      setProcessingCSV(false);
    };

    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, []);

  const onImport = useCallback(async () => {
    setIsImporting(true);
    const messages = [];

    for (let i = 0; i < jsonList.length; i++) {
      try {
        const _item = jsonList[i];

        const pickupSplit = _item.pickup.split("-");
        const dropoffSplit = _item.dropoff.split("-");

        const transformed = {
          company: "ACT",
          status: "ACTIVE",
          pilots: 0,
          flightCrew: 0,
          code: "",
          rate: 0,
        };
        if (pickupSplit.length === 1 && dropoffSplit.length > 1) {
          // Pickup from hotel, dropoff at airport
          const pickupHotel = pickupSplit[0];
          const dropoffAirline = getAirlineFromEntry(dropoffSplit);
          const dropoffFlightNo = getFlightNoFromEntry(dropoffSplit);
          const dropoffTime = getDropoffTimeFromEntry(dropoffSplit);

          transformed.dropoffLocation = _item.airport;
          transformed.pickupLocation = pickupHotel;
          transformed.flightNo = dropoffFlightNo;
          transformed.scheduleDate = dropoffTime || _item.scheduleDate;
          transformed.pass = _item.passenger;
          transformed.client = dropoffAirline;
          transformed.type = "DEPART";
        } else if (pickupSplit.length > 1 && dropoffSplit.length === 1) {
          // Pickup at airport, dropoff at hotel
          const dropoffHotel = dropoffSplit[0];
          const airline = getAirlineFromEntry(pickupSplit);
          const flightNo = getFlightNoFromEntry(pickupSplit);
          const time = getDropoffTimeFromEntry(pickupSplit);

          transformed.dropoffLocation = dropoffHotel;
          transformed.pickupLocation = _item.airport;
          transformed.flightNo = flightNo;
          transformed.scheduleDate = time;
          transformed.pass = _item.passenger;
          transformed.client = airline;
          transformed.type = "ARRIVE";
        } else {
          throw new Error("Invalid pickup/dropoff location format");
        }

        setDriverAndVehicle(_item.airport, transformed);

        if (transformed) {
          console.log("_________transformed data_________", transformed);

          const airlineId = await getAirlineId(transformed.client);
          const companyId = await getCompanyId(transformed.company);
          const driverId = await getDriverId(transformed.driver);
          const vehicleId = await getVehicleId(transformed.vehicle);
          const transportationType = await getTransportationTypeId(
            transformed.type
          );
          const scheduleStatusId = await getScheduleStatusId(
            transformed.status
          );

          const { data: scheduleData, error: scheduleError } = await supabase
            .from("Schedule")
            .insert([
              {
                CompanyID: companyId,
                ScheduleStatusID: scheduleStatusId,
                ScheduleTypeID: 1,
                TransportationTypeID: transportationType,
                AirlineID: airlineId,
                DriverID: driverId,
                VehicleID: vehicleId,
                ScheduleDate: transformed.scheduleDate,
                FlightNo: transformed.flightNo,
                RateOverride: transformed.rate,
                RotationNo: null,
                PickupCode: null,
                AirlineUserID: null,
                CreatedDate: new Date(),
              },
            ])
            .select();

          if (scheduleError) {
            console.log("Error while inserting to db", scheduleError);
            messages.push(transformed.toString());
          }
          const scheduleId = scheduleData[0].ScheduleID;

          const locationId = await getLocationId(transformed.pickupLocation);
          if (locationId) {
            const { error } = await supabase.from("SchedulePickups").insert([
              {
                ScheduleID: scheduleId,
                LocationID: locationId,
                Passengers: transformed.pass,
              },
            ]);

            if (error) messages.push(error.toString());
          } else {
            messages.push(
              `Location ${transformed.pickupLocation} not found for record ${transformed.client} on ${transformed.scheduleDate}`
            );
          }

          const dropLocationId = await getLocationId(
            transformed.dropoffLocation
          );
          if (dropLocationId) {
            const { error } = await supabase.from("ScheduleDropOffs").insert([
              {
                ScheduleID: scheduleId,
                LocationID: locationId,
              },
            ]);

            if (error) messages.push(error.toString());
          } else {
            messages.push(
              `Location ${transformed.dropoffLocation} not found for record ${transformed.client} on ${transformed.scheduleDate}`
            );
          }
        }
      } catch (_err) {
        console.log("Error while inserting to db", _err);
        messages.push(_err.toString());
      }
      setIsImporting(false);
    }
  }, [jsonList]);

  const [pageStatus, setPageStatus] = useState("HQList");
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
    // navigate("/manager-edit");
  };

  const handleSave = () => {
    navigate("/manager-edit");
  };

  const handleBack = () => {
    sessionStorage.getItem("UserRole") === "1"
      ? navigate("/super-admin")
      : navigate("/manager");
  };
  const handleHQ = (title) => {
    setPageStatus(title);
  };
  // const onScheduleImport = useCallback((_option) => {
  //   navigate("/import-xls");
  // }, []);
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
          <button
            className="justify-between rounded-lg ml-1 flex items-center custom-blue-button border-none"
            onClick={addNew}
          >
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
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
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

          {Array.from(
            { length: Math.ceil(drivers.length / driversPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`pagination-button ${
                  currentPage === i + 1 ? "active" : ""
                }`}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(drivers.length / driversPerPage))
              )
            }
            disabled={indexOfLastDriver >= drivers.length}
            className="pagination-button"
          >
            <FaArrowRight className="pagination-icon" />
          </button>
        </div>
      </div>
    );
  };

  const ScheduleContent = ({ title }) => {
    return (
      <div>
        <div className="flex ">
          <h5 className="mb-0">{title}</h5>
        </div>

        <div className="items-center mt-5 personal-info-content">
          <div className="w-100 mt-4 rounded-lg">
            <div className="flex mb-2">
              <div className="flex-1 flex-center">
                <Dropzone onDrop={onDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <section className="dropzone">
                      <div
                        {...getRootProps()}
                        className="w-full h-full flex-center"
                      >
                        <input
                          {...getInputProps()}
                          accept={[
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          ]}
                        />
                        <p>Click to upload or drag and drop</p>
                        <div>File (xlsx)</div>
                      </div>
                    </section>
                  )}
                </Dropzone>
                {fileName ? (
                  <div className="file-name-label">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10.0003 18.3337C14.5837 18.3337 18.3337 14.5837 18.3337 10.0003C18.3337 5.41699 14.5837 1.66699 10.0003 1.66699C5.41699 1.66699 1.66699 5.41699 1.66699 10.0003C1.66699 14.5837 5.41699 18.3337 10.0003 18.3337Z"
                        stroke="#00AF06"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.45801 9.99993L8.81634 12.3583L13.5413 7.6416"
                        stroke="#00AF06"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{fileName}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-4 import-buttons">
            <button
              onClick={onImport}
              disabled={isImporting || isProcessingCSV}
              className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button border-none"
            >
              {isImporting ? (
                <span className="loader"></span>
              ) : (
                <span>Import</span>
              )}
            </button>
            <div>
              {/* <select className="custom-input rounded-lg"> 
                                            <option>BUR</option>
                                        </select> */}
              <div className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button">
                <span>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 w-full">
      <HeaderContainer />
      {/* Top Section */}
      <div className="items-center mt-5">
        <div
          onClick={handleBack}
          className="flex cursor-pointer justify-between items-center w-20 back-button"
        >
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
              <div
                onClick={() => handleHQ("HQList")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Headquarters</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("CompaniesList")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Companies</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("HQCompanies")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>HQ Companies</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("DriverCredentialTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Driver Credential Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("DriverInfractionTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Driver Infraction Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("LocationTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Location Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("ScheduleNoteTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Schedule Note Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("ScheduleStatusesTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Schedule Statuses Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("ScheduleTransportationTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Schedule Transportation Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("ScheduleTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Schedule Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("VehicleLogTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Vehicle Log Types</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("VehicleStatusesTypes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
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
              <div
                onClick={() => handleHQ("ClientList")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
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
              <div
                onClick={() => handleHQ("DriverList")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Driver Lists</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("DriverCredentials")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Driver Credentials</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("DriverInfractions")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Driver Infractions</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("DriverMedical")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Driver Medical</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("DriverNotes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
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
              <div
                onClick={() => handleHQ("LocationList")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
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
              <div
                onClick={() => handleHQ("ScheduleList")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Schedule Lists</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("ScheduleNotes")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Schedule Notes</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                className="flex justify-between mb-4 cursor-pointer hover-row"
                // onClick={onScheduleImport}
                onClick={() => handleHQ("ScheduleImport")}
              >
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
              <div
                onClick={() => handleHQ("VehicleLists")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
                <div className="hover-text">
                  <span>Vehicle Lists</span>
                </div>
                <div className="hover-text">
                  <FaArrowRight />
                </div>
              </div>
              <div
                onClick={() => handleHQ("VehicleLogs")}
                className="flex justify-between mb-4 cursor-pointer hover-row"
              >
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
            {pageStatus === "CompaniesList" && (
              <HQContent title="Companies List" />
            )}
            {pageStatus === "HQCompanies" && (
              <HQContent title="HQ Company List" />
            )}
            {pageStatus === "DriverCredentialTypes" && (
              <HQContent title="Driver Credential Types" />
            )}
            {pageStatus === "DriverInfractionTypes" && (
              <HQContent title="Driver Infraction Types" />
            )}
            {pageStatus === "LocationTypes" && (
              <HQContent title="Location Types" />
            )}
            {pageStatus === "ScheduleNoteTypes" && (
              <HQContent title="Schedule Note Types" />
            )}
            {pageStatus === "ScheduleStatusesTypes" && (
              <HQContent title="Schedule Statuses Types" />
            )}
            {pageStatus === "ScheduleTransportationTypes" && (
              <HQContent title="Schedule Transportation Types" />
            )}
            {pageStatus === "ScheduleTypes" && (
              <HQContent title="Schedule Types" />
            )}
            {pageStatus === "VehicleLogTypes" && (
              <HQContent title="Vehicle Log Types" />
            )}
            {pageStatus === "VehicleStatusesTypes" && (
              <HQContent title="Vehicle Statuses Types" />
            )}
            {pageStatus === "ClientList" && <HQContent title="Client List" />}
            {pageStatus === "DriverList" && <HQContent title="Driver List" />}
            {pageStatus === "DriverCredentials" && (
              <HQContent title="Driver Credentials" />
            )}
            {pageStatus === "DriverInfractions" && (
              <HQContent title="Driver Infractions" />
            )}
            {pageStatus === "DriverMedical" && (
              <HQContent title="Driver Medical" />
            )}
            {pageStatus === "DriverNotes" && <HQContent title="Driver Notes" />}
            {pageStatus === "LocationList" && (
              <HQContent title="Location List" />
            )}
            {pageStatus === "ScheduleList" && (
              <HQContent title="Schedule List" />
            )}
            {pageStatus === "ScheduleNotes" && (
              <HQContent title="Schedule Notes" />
            )}
            {pageStatus === "VehicleLists" && (
              <HQContent title="Vehicle List" />
            )}
            {pageStatus === "VehicleLogs" && <HQContent title="Vehicle Logs" />}
            {pageStatus === "ScheduleImport" && (
              <ScheduleContent title="Schedule Import" />
            )}
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
    </div>
  );
};

export default SuperAdminDetails;

const passValidation = ({ scheduleDate, airport, pickup, dropoff }) => {
  return (
    !!scheduleDate &&
    !!airport &&
    !!airport.trim() &&
    !!pickup &&
    !!dropoff &&
    !!dropoff.trim()
  );
};

function getAirlineFromEntry(parts) {
  return parts[0].split(" ")[0];
}

function getFlightNoFromEntry(parts) {
  return parts[0].split(" ")[1];
}

function getDropoffTimeFromEntry(parts) {
  const timeString = parts[1];
  return dayjs(timeString, "dd MMM HH:mm").toDate();
}

function setDriverAndVehicle(airport, transformed) {
  const airportUpper = airport.toUpperCase();
  const clientUpper = transformed.client.toUpperCase();

  switch (airportUpper) {
    case "LAX":
      transformed.driver = "0152";
      transformed.vehicle = "1002";
      if (clientUpper === "B6") transformed.rate = 62;
      if (clientUpper === "QX") transformed.rate = 65;
      if (clientUpper === "AS") transformed.rate = 65;
      break;
    case "BUR":
      transformed.driver = "0152";
      transformed.vehicle = "1002";
      if (clientUpper === "B6") transformed.rate = 44;
      break;
    case "SDF":
      transformed.driver = "0203";
      transformed.vehicle = "2200";
      if (clientUpper === "WN") transformed.rate = 73;
      break;
    case "LAS":
      transformed.driver = "0178";
      transformed.vehicle = "1701";
      if (clientUpper === "B6") transformed.rate = 39.43;
      if (clientUpper === "RV") transformed.rate = 38;
      if (clientUpper === "AM") transformed.rate = 54;
      if (clientUpper === "AC") transformed.rate = 38;
      break;
    case "MCO":
      transformed.driver = "0193";
      transformed.vehicle = "1500";
      if (clientUpper === "B6") transformed.rate = 40.8;
      if (clientUpper === "WN") transformed.rate = 60;
      break;
    case "MSP":
      transformed.driver = "0201";
      transformed.vehicle = "2001";
      if (clientUpper === "WN") transformed.rate = 70;
      break;
    case "CVG":
      transformed.driver = "0202";
      transformed.vehicle = "2100";
      if (clientUpper === "WN") transformed.rate = 95;
      break;
    case "PHL":
      transformed.driver = "0163";
      transformed.vehicle = "1201";
      if (clientUpper === "F9") transformed.rate = 48;
      break;
    case "DAY":
      transformed.driver = "0168";
      transformed.vehicle = "601";
      if (clientUpper === "ENDEAVOR") transformed.rate = 100;
      if (clientUpper === "9E") transformed.rate = 70;
      break;
    default:
      throw new Error(
        `Airport ${airport} is not currently supported. No default driver and vehicle have been set.`
      );
  }
}

async function getAirlineId(airlineCode) {
  const { data, error } = await supabase
    .from("Airlines")
    .select("AirlineID")
    .eq("AirlineLetterCode", airlineCode)
    .single();

  if (error) throw error;
  return data.AirlineID;
}

async function getCompanyId(companyName) {
  const { data, error } = await supabase
    .from("Companies")
    .select("CompanyID")
    .eq("Name", companyName)
    .single();

  if (error) throw error;
  return data.CompanyID;
}

async function getDriverId(driverCode) {
  const { data, error } = await supabase
    .from("Drivers")
    .select("DriverID")
    .eq("DriverCode", driverCode)
    .single();

  if (error) throw error;
  return data.DriverID;
}

async function getVehicleId(vehicleCode) {
  const { data, error } = await supabase
    .from("Vehicles")
    .select("VehicleID")
    .ilike("Code", `${vehicleCode}%`)
    .single();

  if (error || !data) return 0;
  return data.VehicleID;
}

async function getScheduleStatusId(status) {
  const { data, error } = await supabase
    .from("ScheduleStatuses")
    .select("ScheduleStatusID")
    .eq("Code", status)
    .single();

  if (error) throw error;
  return data.ScheduleStatusID;
}

async function getTransportationTypeId(transportationType) {
  const { data, error } = await supabase
    .from("ScheduleTransportationTypes")
    .select("TransportationTypeID")
    .eq("Code", transportationType)
    .single();

  if (error) throw error;
  return data.TransportationTypeID;
}

async function getLocationId(locationCode) {
  const { data, error } = await supabase
    .from("Locations")
    .select("LocationID")
    .eq("Code", locationCode)
    .single();

  if (error || !data) return null;
  return data.LocationID;
}
