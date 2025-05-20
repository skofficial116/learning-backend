import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { timetableData } from "./timetable.js";

const getStudentTimeTable = asyncHandler(async (req, res) => {
  
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "email/username is required!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, " username/email does not exist. Kindly register.");
  }

  const passwordCheck = await user.isPasswordCorrect(password);

  if (!passwordCheck) {
    throw new ApiError(404, "Invalid User Credentials");
  }

 

  const loggedUser = await User.findById(user._id).select(
    "-password"
  );


  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          getStudentTimeTable: getStudentTimeTable,
        },
        "User logged in Successfully"
      )
    );
});


// /**
//  * Find all occupied classrooms at a specific time and day, including details about the occupying class.
//  * @param {Object} timetableData - The complete timetable data structure
//  * @param {string} day - The day of the week (Monday, Tuesday, etc.)
//  * @param {string} time - The time in format "HH:MM AM/PM" (e.g. "10:10 AM")
//  * @returns {Object} - Contains occupied rooms with details about the occupying classes
//  */
const findOccupiedClassrooms = asyncHandler(async(req,res)=> {
  let { day, time} = req.body;
  if(!day){
    throw new ApiError(400, "day is required!");
  }
  if(!time){
    throw new ApiError(400, "time is required!");
  }
  // Normalize day input (capitalize first letter)
  day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  
  // Object to store occupied rooms and their details
  const occupiedRooms = {};
  
  // Helper function to check if a class is happening at the given time
  function isTimeOverlapping(classTime, queryTime) {
    const [classStartStr, classEndStr] = classTime.split(" - ");
    const queryTimeParts = queryTime.split(" ");
    const queryTimeStr = queryTimeParts[0];
    const queryAmPm = queryTimeParts[1];
    
    // Convert times to minutes since midnight for easier comparison
    function convertToMinutes(timeStr, amPm) {
      let [hours, minutes] = timeStr.split(":");
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (amPm === "PM" && hours !== 12) {
        hours += 12;
      } else if (amPm === "AM" && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    }
    
    const classStartParts = classStartStr.split(" ");
    const classStartAmPm = classStartStr.includes("AM") ? "AM" : "PM";
    const classStartTime = classStartStr.replace(" AM", "").replace(" PM", "");
    
    const classEndParts = classEndStr.split(" ");
    const classEndAmPm = classEndStr.includes("AM") ? "AM" : "PM";
    const classEndTime = classEndStr.replace(" AM", "").replace(" PM", "");
    
    const classStartMinutes = convertToMinutes(classStartTime, classStartAmPm);
    const classEndMinutes = convertToMinutes(classEndTime, classEndAmPm);
    const queryTimeMinutes = convertToMinutes(queryTimeStr, queryAmPm);
    
    return queryTimeMinutes >= classStartMinutes && queryTimeMinutes < classEndMinutes;
  }
  
  // Process timetable data to find occupied rooms
  try {
    // Process BCA data
    if (timetableData.BCA) {
      for (const yearNum in timetableData.BCA) {
        const yearData = timetableData.BCA[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot.Location && isTimeOverlapping(slot.Timing, time)) {
                // Get course details
                const courseCode = slot["Course Code"];
                let courseName = courseCode;
                let instructor = "Unknown";
                
                // Try to get the course name and instructor if available
                if (section.faculty && section.faculty[courseCode]) {
                  courseName = section.faculty[courseCode].name || courseCode;
                  instructor = section.faculty[courseCode].instructor || "Unknown";
                }
                
                // Add to occupied rooms
                if (!occupiedRooms[slot.Location]) {
                  occupiedRooms[slot.Location] = [];
                }
                
                occupiedRooms[slot.Location].push({
                  program: "BCA",
                  year: yearNum,
                  section: sectionId,
                  courseCode: courseCode,
                  courseName: courseName,
                  instructor: instructor,
                  timing: slot.Timing
                });
              }
            }
          }
        }
      }
    }
    
    // Process BCA_AI_DS data
    if (timetableData.BCA_AI_DS) {
      for (const yearNum in timetableData.BCA_AI_DS) {
        const yearData = timetableData.BCA_AI_DS[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot.Location && isTimeOverlapping(slot.Timing, time)) {
                // Get course details
                const courseCode = slot["Course Code"];
                let courseName = courseCode;
                let instructor = "Unknown";
                
                // Try to get the course name and instructor if available
                if (section.faculty && section.faculty[courseCode]) {
                  courseName = section.faculty[courseCode].name || courseCode;
                  instructor = section.faculty[courseCode].instructor || "Unknown";
                }
                
                // Add to occupied rooms
                if (!occupiedRooms[slot.Location]) {
                  occupiedRooms[slot.Location] = [];
                }
                
                occupiedRooms[slot.Location].push({
                  program: "BCA_AI_DS",
                  year: yearNum,
                  section: sectionId,
                  courseCode: courseCode,
                  courseName: courseName,
                  instructor: instructor,
                  timing: slot.Timing
                });
              }
            }
          }
        }
      }
    }
    
    // Library is a special case - check if any section has "LIB" scheduled
    // Check BCA
    if (timetableData.BCA) {
      for (const yearNum in timetableData.BCA) {
        const yearData = timetableData.BCA[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot["Course Code"] === "LIB" && isTimeOverlapping(slot.Timing, time)) {
                if (!occupiedRooms["Library"]) {
                  occupiedRooms["Library"] = [];
                }
                
                occupiedRooms["Library"].push({
                  program: "BCA",
                  year: yearNum,
                  section: sectionId,
                  courseCode: "LIB",
                  courseName: "Library Session",
                  instructor: "N/A",
                  timing: slot.Timing
                });
              }
            }
          }
        }
      }
    }
    
    // Check BCA_AI_DS for Library
    if (timetableData.BCA_AI_DS) {
      for (const yearNum in timetableData.BCA_AI_DS) {
        const yearData = timetableData.BCA_AI_DS[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot["Course Code"] === "LIB" && isTimeOverlapping(slot.Timing, time)) {
                if (!occupiedRooms["Library"]) {
                  occupiedRooms["Library"] = [];
                }
                
                occupiedRooms["Library"].push({
                  program: "BCA_AI_DS",
                  year: yearNum,
                  section: sectionId,
                  courseCode: "LIB",
                  courseName: "Library Session",
                  instructor: "N/A",
                  timing: slot.Timing
                });
              }
            }
          }
        }
      }
    }
    
    // Create a list of all occupied room names for convenience
    const occupiedRoomsList = Object.keys(occupiedRooms);
    
    // return {
    //   day: day,
    //   time: time,
    //   occupiedRoomsList: occupiedRoomsList,
    //   occupiedRoomsCount: occupiedRoomsList.length,
    //   occupiedRooms: occupiedRooms
    // };
    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          day: day,
      time: time,
      occupiedRoomsList: occupiedRoomsList,
      occupiedRoomsCount: occupiedRoomsList.length,
      occupiedRooms: occupiedRooms
        },
        `Occupied rooms data fetched successfully for: ${day}, ${time}!!`
      )
    );
    
  } catch (error) {
    // console.error("Error processing timetable data:", error);
    // return { error: "Error processing timetable data", details: error.message };
    throw new ApiError(404, `Error Fetching the data for occupied rooms at  ${day}, ${time}!!`);
  }
}
)

// /**
//  * Find all empty classrooms at a specific time and day.
//  * @param {Object} timetableData - The complete timetable data structure
//  * @param {string} day - The day of the week (Monday, Tuesday, etc.)
//  * @param {string} time - The time in format "HH:MM AM/PM" (e.g. "10:10 AM")
//  * @returns {Array} - List of all empty classrooms
//  */
const findEmptyClassrooms = asyncHandler(async(req,res)=> {
  // Normalize day input (capitalize first letter)
  let { day, time} = req.body;
  if(!day){
    throw new ApiError(400, "day is required!");
  }
  if(!time){
    throw new ApiError(400, "time is required!");
  }
  day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  
  // List of all possible classrooms
  const allRooms = [
    // Classrooms
    "CR1", "CR2", "CR3", "CR4", "CR5", "CR6", "CR7", "CR8", "CR9", "CR10", "CR11", "CR12",
    // Lecture Theaters
    "LT1", "LT2", "LT3", "LT4", "LT5", "LT6", "LT7", "LT8", "LT9", "LT10", "LT11",
    // Labs
    "Lab 1", "Lab 2", "Lab 3", 
    // Other known locations from timetable
    "Param GF", "Param FF", "Param SF", "AB GF", "AB FF", "Arya Bhatt GF"
  ];
  
  // Get occupied rooms at the specified day and time
  const occupiedRooms = new Set();
  
  // Helper function to check if a class is happening at the given time
  function isTimeOverlapping(classTime, queryTime) {
    const [classStartStr, classEndStr] = classTime.split(" - ");
    const queryTimeParts = queryTime.split(" ");
    const queryTimeStr = queryTimeParts[0];
    const queryAmPm = queryTimeParts[1];
    
    // Convert times to minutes since midnight for easier comparison
    function convertToMinutes(timeStr, amPm) {
      let [hours, minutes] = timeStr.split(":");
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (amPm === "PM" && hours !== 12) {
        hours += 12;
      } else if (amPm === "AM" && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    }
    
    const classStartParts = classStartStr.split(" ");
    const classStartAmPm = classStartStr.includes("AM") ? "AM" : "PM";
    const classStartTime = classStartStr.replace(" AM", "").replace(" PM", "");
    
    const classEndParts = classEndStr.split(" ");
    const classEndAmPm = classEndStr.includes("AM") ? "AM" : "PM";
    const classEndTime = classEndStr.replace(" AM", "").replace(" PM", "");
    
    const classStartMinutes = convertToMinutes(classStartTime, classStartAmPm);
    const classEndMinutes = convertToMinutes(classEndTime, classEndAmPm);
    const queryTimeMinutes = convertToMinutes(queryTimeStr, queryAmPm);
    
    return queryTimeMinutes >= classStartMinutes && queryTimeMinutes < classEndMinutes;
  }
  
  // Process timetable data to find occupied rooms
  try {
    // Process BCA data
    if (timetableData.BCA) {
      for (const yearNum in timetableData.BCA) {
        const yearData = timetableData.BCA[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot.Location && isTimeOverlapping(slot.Timing, time)) {
                occupiedRooms.add(slot.Location);
              }
            }
          }
        }
      }
    }
    
    // Process BCA_AI_DS data
    if (timetableData.BCA_AI_DS) {
      for (const yearNum in timetableData.BCA_AI_DS) {
        const yearData = timetableData.BCA_AI_DS[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot.Location && isTimeOverlapping(slot.Timing, time)) {
                occupiedRooms.add(slot.Location);
              }
            }
          }
        }
      }
    }
    
    // Library is a special case - mark as occupied if any section has "LIB" scheduled
    let isLibraryOccupied = false;
    
    // Check BCA
    if (timetableData.BCA) {
      for (const yearNum in timetableData.BCA) {
        const yearData = timetableData.BCA[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot["Course Code"] === "LIB" && isTimeOverlapping(slot.Timing, time)) {
                isLibraryOccupied = true;
                occupiedRooms.add("Library");
                break;
              }
            }
            if (isLibraryOccupied) break;
          }
        }
        if (isLibraryOccupied) break;
      }
    }
    
    // Check BCA_AI_DS if Library is still not marked as occupied
    if (!isLibraryOccupied && timetableData.BCA_AI_DS) {
      for (const yearNum in timetableData.BCA_AI_DS) {
        const yearData = timetableData.BCA_AI_DS[yearNum];
        for (const sectionId in yearData) {
          const section = yearData[sectionId];
          if (section.timetable && section.timetable[day]) {
            for (const slot of section.timetable[day]) {
              if (slot.Timing && slot["Course Code"] === "LIB" && isTimeOverlapping(slot.Timing, time)) {
                occupiedRooms.add("Library");
                break;
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error("Error processing timetable data:", error);
    return { error: "Error processing timetable data", details: error.message };
  }
  
  // Find empty rooms by filtering out occupied ones
  const emptyRooms = allRooms.filter(room => !occupiedRooms.has(room));
  
  // return {
  //   day: day,
  //   time: time,
  //   emptyRooms: emptyRooms,
  //   totalEmpty: emptyRooms.length,
  //   totalOccupied: occupiedRooms.size
  // };
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          day: day,
    time: time,
    emptyRooms: emptyRooms,
    totalEmpty: emptyRooms.length,
    totalOccupied: occupiedRooms.size
        },
        `Occupied rooms data fetched successfully for: ${day}, ${time}!!`
      )
    );
}
)



export {findEmptyClassrooms, findOccupiedClassrooms}