const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const sql = require("mssql");
const path = require("path");
const { DateTime } = require("luxon");

const app = express();
const upload = multer({ dest: "uploads/" });

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// ScheduleEntry class (equivalent to C# class)
class ScheduleEntry {
  constructor(
    scheduleDate,
    passengers,
    airport,
    pickupLocation,
    dropoffLocation
  ) {
    this.scheduleDate = scheduleDate;
    this.passengers = passengers;
    this.airport = airport;
    this.pickupLocation = pickupLocation;
    this.dropoffLocation = dropoffLocation;
  }
}

// ScheduleImportData class (equivalent to C# class)
class ScheduleImportData {
  constructor() {
    this.company = "ACT";
    this.status = "ACTIVE";
    this.pilots = 0;
    this.flightCrew = 0;
    this.code = "";
    this.rate = 0;
  }
}

// Convert CSV file to ScheduleEntry array
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => {
            // Map CSV headers to match your C# implementation
            switch (header.trim()) {
              case "Pickup Date/Time":
                return "scheduleDate";
              case "Passengers":
                return "passengers";
              case "Pickup":
                return "pickupLocation";
              case "Dropoff":
                return "dropoffLocation";
              case "Airport":
                return "airport";
              default:
                return null;
            }
          },
          mapValues: ({ header, value }) => {
            // Convert values appropriately
            if (header === "scheduleDate") {
              try {
                // Try parsing with "dd MMM HH:mm" format first
                return DateTime.fromFormat(
                  value.trim(),
                  "dd MMM HH:mm"
                ).toJSDate();
              } catch (e) {
                // Fallback to default parsing
                return new Date(value.trim());
              }
            } else if (header === "passengers") {
              return parseInt(value.trim(), 10) || 0;
            }
            return value.trim();
          },
        })
      )
      .on("data", (data) =>
        results.push(
          new ScheduleEntry(
            data.scheduleDate,
            data.passengers,
            data.airport,
            data.pickupLocation,
            data.dropoffLocation
          )
        )
      )
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Main import route handler
app.post("/api/schedule/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const records = await parseCSV(req.file.path);
    const messages = [];
    let lastScheduleDate = null;

    // Process each record
    for (const record of records) {
      if (!record.scheduleDate) {
        record.scheduleDate = lastScheduleDate;
      } else {
        lastScheduleDate = record.scheduleDate;
      }

      try {
        // Transform and save the record
        const transformed = transformScheduleEntry(record);
        if (transformed) {
          await saveNewScheduleToDatabase(transformed, messages);
        }
      } catch (ex) {
        messages.push(ex.toString());
      }
    }

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    // Return results
    if (messages.length > 0) {
      res.status(200).json({
        success: false,
        message: "Import completed with errors",
        details: messages.join("\n"),
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Schedule imported successfully",
      });
    }
  } catch (error) {
    console.error("Import failed:", error);
    res.status(500).json({
      error: "Import failed",
      details: error.message,
    });
  }
});

// Transform ScheduleEntry to ScheduleImportData
function transformScheduleEntry(scheduleEntry) {
  if (!passesValidation(scheduleEntry)) return null;

  const transformed = new ScheduleImportData();

  const pickupSplit = scheduleEntry.pickupLocation.split("-");
  const dropoffSplit = scheduleEntry.dropoffLocation.split("-");

  if (pickupSplit.length === 1 && dropoffSplit.length > 1) {
    // Pickup from hotel, dropoff at airport
    const pickupHotel = pickupSplit[0];
    const dropoffAirline = getAirlineFromEntry(dropoffSplit);
    const dropoffFlightNo = getFlightNoFromEntry(dropoffSplit);
    const dropoffTime = getDropoffTimeFromEntry(dropoffSplit);

    transformed.dropoffLocation = scheduleEntry.airport;
    transformed.pickupLocation = pickupHotel;
    transformed.flightNo = dropoffFlightNo;
    transformed.scheduleDate = dropoffTime || scheduleEntry.scheduleDate;
    transformed.pass = scheduleEntry.passengers;
    transformed.client = dropoffAirline;
    transformed.type = "DEPART";
  } else if (pickupSplit.length > 1 && dropoffSplit.length === 1) {
    // Pickup at airport, dropoff at hotel
    const dropoffHotel = dropoffSplit[0];
    const airline = getAirlineFromEntry(pickupSplit);
    const flightNo = getFlightNoFromEntry(pickupSplit);
    const time = getDropoffTimeFromEntry(pickupSplit);

    transformed.dropoffLocation = dropoffHotel;
    transformed.pickupLocation = scheduleEntry.airport;
    transformed.flightNo = flightNo;
    transformed.scheduleDate = time;
    transformed.pass = scheduleEntry.passengers;
    transformed.client = airline;
    transformed.type = "ARRIVE";
  } else {
    throw new Error("Invalid pickup/dropoff location format");
  }

  setDriverAndVehicle(scheduleEntry.airport, transformed);
  return transformed;
}

// Validation function
function passesValidation(scheduleEntry) {
  if (!scheduleEntry.scheduleDate) return false;
  if (!scheduleEntry.airport || !scheduleEntry.airport.trim()) return false;
  if (!scheduleEntry.pickupLocation || !scheduleEntry.pickupLocation.trim())
    return false;
  if (!scheduleEntry.dropoffLocation || !scheduleEntry.dropoffLocation.trim())
    return false;
  return true;
}

// Helper functions for data transformation
function getAirlineFromEntry(parts) {
  return parts[0].split(" ")[0];
}

function getFlightNoFromEntry(parts) {
  return parts[0].split(" ")[1];
}

function getDropoffTimeFromEntry(parts) {
  const timeString = parts[1];
  return DateTime.fromFormat(timeString, "dd MMM HH:mm").toJSDate();
}

// Set driver and vehicle based on airport
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

// Database operations
async function saveNewScheduleToDatabase(record, messages) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);

    const airlineId = await getAirlineId(record.client, pool);
    const companyId = await getCompanyId(record.company, pool);
    const driverId = await getDriverId(record.driver, pool);
    const vehicleId = await getVehicleId(record.vehicle, pool);
    const transportationType = await getTransportationTypeId(record.type, pool);
    const scheduleStatusId = await getScheduleStatusId(record.status, pool);

    const query = `
            INSERT INTO Schedule (
                CompanyId, ScheduleStatusId, ScheduleTypeId, 
                TransportationTypeID, AirlineID, DriverID, VehicleID, ScheduleDate,
                FlightNo, RateOverride, RotationNo, PickupCode, AirlineUserID, CreatedDate
            ) VALUES (
                @companyId, @scheduleStatusId, 1, 
                @transportationType, @airlineId, @driverId, @vehicleId, @scheduleDate,
                @flightNo, @rateOverride, NULL, NULL, NULL, @createdDate
            ); SELECT SCOPE_IDENTITY() AS scheduleId;
        `;

    const result = await pool
      .request()
      .input("companyId", sql.Int, companyId)
      .input("scheduleStatusId", sql.Int, scheduleStatusId)
      .input("transportationType", sql.Int, transportationType)
      .input("airlineId", sql.Int, airlineId)
      .input("driverId", sql.Int, driverId)
      .input("vehicleId", sql.Int, vehicleId)
      .input("scheduleDate", sql.DateTime, record.scheduleDate)
      .input("flightNo", sql.NVarChar, record.flightNo)
      .input("rateOverride", sql.Decimal(18, 2), record.rate)
      .input("createdDate", sql.DateTime, new Date())
      .query(query);

    const scheduleId = result.recordset[0].scheduleId;

    await saveSchedulePickup(scheduleId, record, pool, messages);
    await saveScheduleDropoff(scheduleId, record, pool, messages);
  } catch (ex) {
    messages.push(ex.message);
  } finally {
    if (pool) await pool.close();
  }
}

async function saveSchedulePickup(scheduleId, record, pool, messages) {
  try {
    const locationId = await getLocationId(record.pickupLocation, pool);
    if (locationId) {
      await pool
        .request()
        .input("scheduleId", sql.Int, scheduleId)
        .input("locationId", sql.Int, locationId)
        .input("passengers", sql.Int, record.pass).query(`
                    INSERT INTO SchedulePickups (ScheduleID, LocationID, Passengers)
                    VALUES (@scheduleId, @locationId, @passengers)
                `);
    } else {
      messages.push(
        `Location ${record.pickupLocation} not found for record ${record.client} on ${record.scheduleDate}`
      );
    }
  } catch (ex) {
    messages.push(ex.message);
  }
}

async function saveScheduleDropoff(scheduleId, record, pool, messages) {
  try {
    const locationId = await getLocationId(record.dropoffLocation, pool);
    if (locationId) {
      await pool
        .request()
        .input("scheduleId", sql.Int, scheduleId)
        .input("locationId", sql.Int, locationId).query(`
                    INSERT INTO ScheduleDropOffs (ScheduleID, LocationID)
                    VALUES (@scheduleId, @locationId)
                `);
    } else {
      messages.push(
        `Location ${record.dropoffLocation} not found for record ${record.client} on ${record.scheduleDate}`
      );
    }
  } catch (ex) {
    messages.push(ex.message);
  }
}

// Helper functions for database lookups
async function getAirlineId(airlineCode, pool) {
  const result = await pool
    .request()
    .input("airlineCode", sql.NVarChar, airlineCode)
    .query(
      "SELECT AirlineID FROM Airlines WHERE AirlineLetterCode = @airlineCode"
    );
  return result.recordset[0].AirlineID;
}

async function getCompanyId(companyName, pool) {
  const result = await pool
    .request()
    .input("companyName", sql.NVarChar, companyName)
    .query("SELECT TOP 1 CompanyID FROM Companies WHERE Name = @companyName");
  return result.recordset[0].CompanyID;
}

async function getDriverId(driverCode, pool) {
  const result = await pool
    .request()
    .input("driverCode", sql.NVarChar, driverCode)
    .query("SELECT TOP 1 DriverID FROM Drivers WHERE DriverCode = @driverCode");
  return result.recordset[0].DriverID;
}

async function getVehicleId(vehicleCode, pool) {
  const result = await pool
    .request()
    .input("vehicleCode", sql.NVarChar, vehicleCode + "%")
    .query("SELECT TOP 1 VehicleID FROM Vehicles WHERE Code LIKE @vehicleCode");
  return result.recordset[0]?.VehicleID || 0;
}

async function getScheduleStatusId(status, pool) {
  const result = await pool
    .request()
    .input("status", sql.NVarChar, status)
    .query(
      "SELECT ScheduleStatusID FROM ScheduleStatuses WHERE Code = @status"
    );
  return result.recordset[0].ScheduleStatusID;
}

async function getTransportationTypeId(transportationType, pool) {
  const result = await pool
    .request()
    .input("type", sql.NVarChar, transportationType)
    .query(
      "SELECT TransportationTypeID FROM ScheduleTransportationTypes WHERE Code = @type"
    );
  return result.recordset[0].TransportationTypeID;
}

async function getLocationId(locationCode, pool) {
  const result = await pool
    .request()
    .input("locationCode", sql.NVarChar, locationCode)
    .query("SELECT LocationID FROM Locations WHERE Code = @locationCode");
  return result.recordset[0]?.LocationID || null;
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
