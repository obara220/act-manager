import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";

import Driver from "../../images/Male.png";
import "./index.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const DriverCredentials = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [tsaCheck, setTsaCheck] = useState(null); // null, true, or false
  const [certificationFile, setCertificationFile] = useState(null);
  const [certificationUrl, setCertificationUrl] = useState("");
  const [dmvStatus, setDmvStatus] = useState(null);

  const driverId = useSelector((state) => state.auth.driverId);
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
  const handleSave = async () => {
    try {
      let certificationImageUrl = "";

      if (certificationFile) {
        const fileExt = certificationFile.name.split(".").pop();
        const fileName = `cert_${Date.now()}.${fileExt}`;
        const filePath = `driver-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("driver-certifications")
          .upload(filePath, certificationFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("driver-certifications")
          .getPublicUrl(filePath);

        certificationImageUrl = data.publicUrl;
        setCertificationUrl(certificationImageUrl);
      }

      const { error } = await supabase.from("DriverCredentials").insert([
        {
          DriverID: driverId,
          Number: licenseNumber,
          Expiration: licenseExpiry,
          //   TSABackgroundCheck: tsaCheck,
          Photo: certificationUrl,
          //   DMVRecordStatus: dmvStatus,
        },
      ]);

      if (error) throw error;

      toast.success("Driver credentials saved!");
      navigate("/vehicle-assignment");
    } catch (err) {
      console.error("Error saving credentials:", err.message);
      toast.error("Failed to save driver credentials.");
    }
  };

  const handleBack = () => {
    navigate("/driver-new");
  };
  return (
    <div className="p-6 w-full">
      <HeaderContainer />
      {/* Top Section */}
      <div className="items-center mt-5 personal-info-content">
        <div
          onClick={handleBack}
          className="flex cursor-pointer justify-between items-center w-20 back-button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </div>
        <p className="pt-4 font-semibold text-lg">Driver Credentials</p>
        <span>Update your driver credentials to ensure smooth operations</span>
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <div>
              <p>Driver's License Number</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="custom-input rounded-lg w-100"
              />
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>License Expiry Date</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="custom-input rounded-lg w-100 "
              />
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>TSA Background Check</p>
            </div>
            <div className="flex w-35">
              <label className="flex mr-1 items-center">
                <input
                  type="checkbox"
                  checked={tsaCheck === true}
                  onChange={() => setTsaCheck(true)}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tsaCheck === false}
                  onChange={() => setTsaCheck(false)}
                  className="mr-1"
                />
                No
              </label>
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>Driver Certification</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCertificationFile(e.target.files[0])}
                className="custom-input rounded-lg w-100"
              />
            </div>
            {/* <div className="flex justify-between w-35">
              <input
                type="number"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className="custom-input rounded-lg w-100"
              />
            </div> */}
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>DMV Record Status</p>
            </div>
            <div className="flex justify-between w-35">
              <div className="flex w-35">
                <label className="flex mr-1 items-center">
                  <input
                    type="checkbox"
                    checked={dmvStatus === true}
                    onChange={() => setDmvStatus(true)}
                    className="mr-1"
                  />
                  Clear
                </label>
                <label className="flex mr-1 items-center">
                  <input
                    type="checkbox"
                    checked={dmvStatus === false}
                    onChange={() => setDmvStatus(false)}
                    className="mr-1"
                  />
                  Pending
                </label>
                {/* <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dmvStatus === false}
                    onChange={() => setDmvStatus(false)}
                    className="mr-1"
                  />
                  Expired
                </label> */}
              </div>

              {/* <input
                type="text"
                value={dmvStatus}
                onChange={(e) => setDmvStatus(e.target.value)}
                className="custom-input rounded-lg w-100 "
              /> */}
            </div>
          </div>

          <div className="flex justify-between mt-4 save-button">
            <div
              onClick={handleSave}
              className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button"
            >
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
    </div>
  );
};

export default DriverCredentials;
