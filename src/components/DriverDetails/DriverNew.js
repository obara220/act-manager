import React, { useState, useEffect } from "react";
import { FaInfoCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import HeaderContainer from "../CrewDashboard/HeaderContainer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";
import LoadingComponent from "../../components/LoadingComponent";
import Driver from "../../images/Male.png";
import "./index.css";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const DriverDetail = () => {
  const dispatch = useDispatch(); // Initialize dispatch

  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSessionAndUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (user) {
          console.log("User is signed in:", user);
        }
      } else {
        console.log("No session found. User not signed in.");
      }
    };

    getSessionAndUser();
  }, []);
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    profilePhoto: null,
    phone: "",
    email: "",
    password: "",
    address: "",
  });

  // Pagination Logic
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = drivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const addNew = () => {
    navigate("/driver-new");
  };
  const handleSave = async () => {
    try {
      setLoading(true); // start loading

      // 1. Upload photo to Supabase Storage
      let photoUrl = null;
      const { file } = formData.profilePhoto || {};
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `driver-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("driver-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("driver-photos")
          .getPublicUrl(filePath);
        photoUrl = data.publicUrl;
      }

      // 2. Insert data into Supabase table
      const { data: insertedDriver, error: insertError } = await supabase
        .from("Drivers")
        .insert([
          {
            FirstName: formData.firstName,
            LastName: formData.lastName,
            DOB: formData.dob,
            DriverPhoto: photoUrl,
            Phone: formData.phone,
            //   Email: formData.email,
            Password: formData.password,
            Address: formData.address,
          },
        ])
        .select();

      if (insertError) throw insertError;
      if (insertedDriver) {
        toast.success("Driver saved successfully!");

        const driverId = insertedDriver[0].DriverID; // or .id depending on your schema
        dispatch({ type: "DRIVER_ID", payload: driverId });
        // Optional: Navigate to next screen
        navigate("/driver-credentials");
      }
    } catch (error) {
      console.error("Error saving driver:", error.message);
      toast.error("Failed to save driver. Check console for details.");
      // alert("Failed to save driver. Check console for details.");
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleBack = () => {
    sessionStorage.getItem("UserRole") === "1"
      ? navigate("/super-admin")
      : navigate("/manager");
  };
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "profilePhoto" && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file); // for preview
      setFormData((prev) => ({
        ...prev,
        profilePhoto: { file, previewUrl },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
        <p className="pt-4 font-semibold text-lg">Personal Information</p>
        <span>Update driver's photo and personal details here</span>
        <div className="w-100 mt-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <div>
              <p>Full Name</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mr-1 custom-input rounded-lg"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className=" custom-input rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>Date of Birth</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="custom-input rounded-lg w-100"
              />
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>Profile Photo</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="custom-input rounded-lg"
              />
              {formData.profilePhoto?.previewUrl && (
                <img
                  src={formData.profilePhoto.previewUrl}
                  alt="Preview"
                  className="mt-2 rounded-lg"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>Phone Number</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                value={formData.phone}
                onChange={handleChange}
                type="number"
                name="phone"
                className="custom-input rounded-lg w-100 "
              />
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div>
              <p>Email Address</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="custom-input rounded-lg w-100 "
              />
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Password</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="custom-input rounded-lg w-100 "
              />
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p>Home Address</p>
            </div>
            <div className="flex justify-between w-35">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="custom-input rounded-lg w-100 "
              />
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
              <div
                onClick={() =>
                  setFormData({
                    firstName: "",
                    lastName: "",
                    dob: "",
                    transportType: "Air Crew Transport",
                    phone: "",
                    email: "",
                    password: "",
                    address: "",
                  })
                }
                className="justify-between pl-20 pr-20 p-2 rounded-lg flex items-center custom-white-button"
              >
                <span>Clear</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetail;
