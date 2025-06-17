import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { supabase } from "../../supabaseClient";
import { FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";

import "./index.css";

const ImportXls = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState();
  const [jsonList, setJsonList] = useState([]);
  const [errorList, setErrorList] = useState([]);

  const handleSave = useCallback(() => {
    navigate("/import-xls");
  }, []);
  const handleBack = useCallback(() => {
    sessionStorage.getItem("UserRole") === "1"
      ? navigate("/super-admin")
      : navigate("/manager");
    // navigate("/manager");
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
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
    };
    reader.onerror = () => {};

    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, []);

  const onImport = useCallback(async () => {
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
          transformed.pass = _item.passengers;
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
          transformed.pass = _item.passengers;
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
                CompanyId: companyId,
                ScheduleStatusId: scheduleStatusId,
                ScheduleTypeId: 1,
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
          const scheduleId = scheduleData[0].id;

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
    }
  }, [jsonList]);

  return (
    <div className="p-6 w-full">
      <HeaderContainer />
      {/* <div onClick={handleBack} className="flex justify-between items-center w-20 back-button">
                <FaArrowLeft />
                <span>Back</span>
            </div> */}
      {/* Top Section */}
      <div className="items-center mt-5 personal-info-content">
        <div
          onClick={handleBack}
          className="flex justify-between cursor-pointer items-center w-20 back-button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </div>
        <p className="pt-4 font-semibold text-lg">Import Data</p>
        <span>
          Easily upload driver, vehicle, and flight data in bulk. Ensure
          accuracy by using the provided template format.
        </span>
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex mb-2">
            <div>
              <p>Upload</p>
            </div>
            <div className="flex-1 flex-center">
              <Dropzone onDrop={onDrop}>
                {({ getRootProps, getInputProps }) => (
                  <section className="dropzone">
                    <div {...getRootProps()} className="flex-center">
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
          <div
            onClick={onImport}
            className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button"
          >
            <span>Import</span>
          </div>
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

export default ImportXls;

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
    .select("id")
    .eq("AirlineLetterCode", airlineCode)
    .single();

  if (error) throw error;
  return data.id;
}

async function getCompanyId(companyName) {
  const { data, error } = await supabase
    .from("Companies")
    .select("id")
    .eq("Name", companyName)
    .single();

  if (error) throw error;
  return data.id;
}

async function getDriverId(driverCode) {
  const { data, error } = await supabase
    .from("Drivers")
    .select("id")
    .eq("DriverCode", driverCode)
    .single();

  if (error) throw error;
  return data.id;
}

async function getVehicleId(vehicleCode) {
  const { data, error } = await supabase
    .from("Vehicles")
    .select("id")
    .ilike("Code", `${vehicleCode}%`)
    .single();

  if (error || !data) return 0;
  return data.id;
}

async function getScheduleStatusId(status) {
  const { data, error } = await supabase
    .from("ScheduleStatuses")
    .select("id")
    .eq("Code", status)
    .single();

  if (error) throw error;
  return data.id;
}

async function getTransportationTypeId(transportationType) {
  const { data, error } = await supabase
    .from("ScheduleTransportationTypes")
    .select("id")
    .eq("Code", transportationType)
    .single();

  if (error) throw error;
  return data.id;
}

async function getLocationId(locationCode) {
  const { data, error } = await supabase
    .from("Locations")
    .select("id")
    .eq("Code", locationCode)
    .single();

  if (error || !data) return null;
  return data.id;
}
