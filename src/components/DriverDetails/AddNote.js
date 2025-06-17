import React, { useState } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import Driver from "../../images/Male.png";
import "./index.css";

const AddNote = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [note, setNote] = useState("");
  const scheduleId = useSelector((state) => state.scheduleId);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const addNew = () => {
    navigate("/vehicle-assignment");
  };
  const handleSave = async () => {
    try {
      if (scheduleId) {
        const { data: insertedScheduleNote, error: insertError } =
          await supabase
            .from("ScheduleNotes")
            .insert([
              {
                ScheduleID: scheduleId,
                Memo: note,
              },
            ])
            .select();

        if (insertError) throw insertError;
        if (insertedScheduleNote) {
          toast.success("Schedule Note saved successfully!");

          // const driverId = insertedDriver[0].DriverID; // or .id depending on your schema
          // dispatch({ type: "DRIVER_ID", payload: driverId });
          // Optional: Navigate to next screen
          // navigate("/driver-credentials");
        }
      }
    } catch (error) {
      console.error("Error saving note:", error.message);
      toast.error("Failed to save note. Check console for details.");
      // alert("Failed to save driver. Check console for details.");
    } finally {
      //   setLoading(false); // stop loading
    }
    // navigate("/import-data");
  };
  const handleBack = () => {
    sessionStorage.getItem("UserRole") === "1"
      ? navigate("/super-admin")
      : navigate("/manager");
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
        <p className="font-semibold text-lg">Add Note</p>
        {/* <span>Easily upload driver, vehicle, and flight data in bulk. Ensure accuracy by using the provided template format.</span> */}
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <div>
              <p>Note to Driver</p>
            </div>
            <div className="flex justify-between w-35">
              <textarea
                className="custom-input w-100"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any important notes or special instructions here.."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-between mt-4 save-button">
            <div
              onClick={handleSave}
              className="justify-between p-2 pr-20 pl-20 rounded-lg mr-1 flex items-center custom-blue-button"
            >
              <span>Save</span>
            </div>
            <div>
              <div className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button">
                <span>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNote;
