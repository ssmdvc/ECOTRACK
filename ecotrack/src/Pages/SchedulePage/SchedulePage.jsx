"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Navbar from "../../Components/Navbar/Navbar";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase.js"; // Import Firestore instance from firebase.js
import "./SchedulePage.scss";

const SchedulePage = () => {
  // State management
  const [date, setDate] = useState(new Date());
  const [drivers, setDrivers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState({});
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Time picker refs
  const timePickerRef = useRef(null);
  const timeInputRef = useRef(null);

  // Form state
  const [newDriver, setNewDriver] = useState({ name: "", id: "" });
  const [newSchedule, setNewSchedule] = useState({
    status: "Pending",
    truckId: "",
    driver: "",
    route: "",
    estimatedTime: "",
    date: new Date().toISOString().split("T")[0], // Add default date
  });

  // Initialize weekly schedule structure
  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const initialWeeklySchedules = {};

    days.forEach((day) => {
      initialWeeklySchedules[day] = {
        truck1: { route: "" },
        truck2: { route: "" },
      };
    });

    setWeeklySchedules(initialWeeklySchedules);
  }, []);

  // Handle clicks outside the time picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target) &&
        timeInputRef.current &&
        !timeInputRef.current.contains(event.target)
      ) {
        setShowTimePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [timePickerRef]);

  // Fetch data from Firestore on component mount
  useEffect(() => {
    console.log("Starting to fetch data from Firestore");
    setLoading(true);

    try {
      // Set up listeners for drivers collection
      const driversUnsubscribe = onSnapshot(
        collection(db, "drivers"),
        (snapshot) => {
          console.log("Drivers data received:", !snapshot.empty);
          const driversList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDrivers(driversList);
          console.log("Drivers loaded:", driversList.length);
        },
        (error) => {
          console.error("Error fetching drivers:", error);
          setError("Failed to load drivers. Please try again later.");
        }
      );

      // Set up listeners for schedules collection
      const schedulesUnsubscribe = onSnapshot(
        collection(db, "schedules"),
        (snapshot) => {
          console.log("Schedules data received:", !snapshot.empty);
          const schedulesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSchedules(schedulesList);
          console.log("Schedules loaded:", schedulesList.length);

          // Sync with weekly schedules
          if (schedulesList.length > 0) {
            syncWeeklySchedules();
          }
        },
        (error) => {
          console.error("Error fetching schedules:", error);
          setError("Failed to load schedules. Please try again later.");
          setLoading(false);
        }
      );

      // Set up listeners for weekly schedules collection
      const weeklySchedulesUnsubscribe = onSnapshot(
        collection(db, "weeklySchedules"),
        (snapshot) => {
          console.log("Weekly schedules data received:", !snapshot.empty);

          // Initialize with empty values
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const weekly = {};
          days.forEach((day) => {
            weekly[day] = { truck1: { route: "" }, truck2: { route: "" } };
          });

          // Fill with data from Firestore
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (weekly[data.day]) {
              if (data.truckId === "0001") {
                weekly[data.day].truck1.route = data.route || "";
              } else if (data.truckId === "0002") {
                weekly[data.day].truck2.route = data.route || "";
              }
            }
          });

          setWeeklySchedules(weekly);
          setLoading(false);
          console.log("Weekly schedules loaded");
        },
        (error) => {
          console.error("Error fetching weekly schedules:", error);
          setError("Failed to load weekly schedules. Please try again later.");
          setLoading(false);
        }
      );

      // Cleanup function to unsubscribe from Firestore listeners
      return () => {
        driversUnsubscribe();
        schedulesUnsubscribe();
        weeklySchedulesUnsubscribe();
        console.log("Firestore listeners unsubscribed");
      };
    } catch (err) {
      console.error("Error setting up Firestore:", err);
      setError("Failed to connect to the database. Please try again later.");
      setLoading(false);
    }
  }, []);

  // Add a new driver to Firestore
  const addDriver = async () => {
    if (!newDriver.name || !newDriver.id) {
      alert("Please fill in all driver fields");
      return;
    }

    try {
      await addDoc(collection(db, "drivers"), {
        ...newDriver,
        avatar: "/placeholder.svg", // Default avatar
      });

      // Reset form
      setNewDriver({ name: "", id: "" });
      setShowAddDriverForm(false);
    } catch (error) {
      console.error("Error adding driver:", error);
      alert("Failed to add driver. Please try again.");
    }
  };

  ///Delete Driver from Firestore
  const deleteDriver = async (driverId) => {
    try {
      // Delete from drivers collection
      await deleteDoc(doc(db, "drivers", driverId));
      console.log(`Driver ${driverId} deleted from Firestore`);

      // Update the UI state by filtering out the deleted driver
      setDrivers((prevDrivers) =>
        prevDrivers.filter((driver) => driver.id !== driverId)
      );

      console.log(`Driver ${driverId} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting driver:", error);
      alert(`Failed to delete driver: ${error.message}. Please try again.`);
    }
  };

  // Add a new schedule to Firestore
  const addSchedule = async () => {
    if (
      !newSchedule.truckId ||
      !newSchedule.driver ||
      !newSchedule.route ||
      !newSchedule.estimatedTime
    ) {
      alert("Please fill in all schedule fields");
      return;
    }

    try {
      // Add to schedules collection
      await addDoc(collection(db, "schedules"), {
        ...newSchedule,
      });

      // Also update weekly schedule
      // First, determine the day of week from the selected date
      const scheduleDate = new Date(newSchedule.date);
      const dayIndex = scheduleDate.getDay();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[dayIndex];

      // Update the weekly schedule for this day and truck
      await updateWeeklySchedule(
        dayName,
        newSchedule.truckId,
        newSchedule.route
      );

      // Reset form
      setNewSchedule({
        status: "Pending",
        truckId: "",
        driver: "",
        route: "",
        estimatedTime: "",
        date: new Date().toISOString().split("T")[0], // Reset to today's date
      });
      setShowAddScheduleForm(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
      alert("Failed to add schedule. Please try again.");
    }
  };

  // Delete a schedule from Firestore
  const deleteSchedule = async (scheduleId) => {
    try {
      // Get the schedule before deleting it
      const scheduleToDelete = schedules.find((s) => s.id === scheduleId);

      // Delete from schedules collection
      await deleteDoc(doc(db, "schedules", scheduleId));

      // If this is the only schedule for this day and truck, also update weekly schedule
      if (scheduleToDelete) {
        const scheduleDate = new Date(scheduleToDelete.date);
        const dayIndex = scheduleDate.getDay();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = days[dayIndex];

        // Check if there are other schedules for this day and truck
        const otherSchedulesForSameDayAndTruck = schedules.filter(
          (s) =>
            s.id !== scheduleId &&
            s.truckId === scheduleToDelete.truckId &&
            new Date(s.date).getDay() === dayIndex
        );

        // If no other schedules, clear the weekly schedule entry
        if (otherSchedulesForSameDayAndTruck.length === 0) {
          await updateWeeklySchedule(dayName, scheduleToDelete.truckId, "");
        }
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule. Please try again.");
    }
  };

  // Update a schedule status in Firestore
  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      await updateDoc(doc(db, "schedules", scheduleId), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating schedule status:", error);
      alert("Failed to update schedule status. Please try again.");
    }
  };

  // Update weekly schedule in Firestore
  const updateWeeklySchedule = async (day, truckId, newRoute) => {
    try {
      // Create a unique ID for the weekly schedule entry
      const docId = `${day}_${truckId}`;

      // Reference to the document
      const weeklyScheduleRef = doc(db, "weeklySchedules", docId);

      // Set the document with merge option to update if exists or create if not
      await setDoc(
        weeklyScheduleRef,
        {
          day,
          truckId,
          route: newRoute,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`Updated weekly schedule for ${day}, truck ${truckId}`);
    } catch (error) {
      console.error("Error updating weekly schedule:", error);
      alert("Failed to update weekly schedule. Please try again.");
    }
  };

  // Handle time selection
  const handleTimeSelect = (hours, minutes, period) => {
    const formattedTime = `${hours}:${minutes} ${period}`;
    setNewSchedule({ ...newSchedule, estimatedTime: formattedTime });
    // Keep the picker open to allow for adjustments
  };

  // Render time picker
  const renderTimePicker = () => {
    const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
    const minutes = ["00", "15", "30", "45"];
    const periods = ["AM", "PM"];

    // Parse current time values
    const timeRegex = /^(\d+):(\d+)\s(AM|PM)$/;
    const currentTime = newSchedule.estimatedTime || "12:00 AM";
    const match = currentTime.match(timeRegex);

    const currentHour = match ? Number.parseInt(match[1]) : 12;
    const currentMinute = match ? match[2] : "00";
    const currentPeriod = match ? match[3] : "AM";

    return (
      <div className="time-picker" ref={timePickerRef}>
        <div className="time-picker-header">
          <h3>Select Time</h3>
          <button
            className="close-btn"
            onClick={() => setShowTimePicker(false)}
          >
            ×
          </button>
        </div>
        <div className="time-picker-content">
          <div className="time-column">
            <div className="time-column-header">Hour</div>
            <div className="time-column-items">
              {hours.map((hour) => (
                <div
                  key={`hour-${hour}`}
                  className={`time-item ${
                    hour === currentHour ? "selected" : ""
                  }`}
                  onClick={() => {
                    handleTimeSelect(hour, currentMinute, currentPeriod);
                  }}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
          <div className="time-column">
            <div className="time-column-header">Minute</div>
            <div className="time-column-items">
              {minutes.map((minute) => (
                <div
                  key={`minute-${minute}`}
                  className={`time-item ${
                    minute === currentMinute ? "selected" : ""
                  }`}
                  onClick={() => {
                    handleTimeSelect(currentHour, minute, currentPeriod);
                  }}
                >
                  {minute}
                </div>
              ))}
            </div>
          </div>
          <div className="time-column">
            <div className="time-column-header">AM/PM</div>
            <div className="time-column-items">
              {periods.map((period) => (
                <div
                  key={`period-${period}`}
                  className={`time-item ${
                    period === currentPeriod ? "selected" : ""
                  }`}
                  onClick={() => {
                    handleTimeSelect(currentHour, currentMinute, period);
                  }}
                >
                  {period}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render calendar
  const renderCalendar = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
      const isSelected = currentDate.toDateString() === date.toDateString();
      const isToday = currentDate.toDateString() === new Date().toDateString();

      // Check if there are schedules for this day
      const dateString = currentDate.toISOString().split("T")[0];
      const hasSchedules = schedules.some(
        (schedule) => schedule.date === dateString
      );

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          } ${hasSchedules ? "has-schedules" : ""}`}
          onClick={() => setDate(currentDate)}
        >
          {i}
        </div>
      );
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <button
            onClick={() =>
              setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
            }
          >
            &lt;
          </button>
          <div>
            {monthNames[date.getMonth()]} {date.getFullYear()}
          </div>
          <button
            onClick={() =>
              setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
            }
          >
            &gt;
          </button>
        </div>
        <div className="calendar-days">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          {days}
        </div>
      </div>
    );
  };

  // Get today's schedules
  const getTodaySchedules = () => {
    const dateString = date.toISOString().split("T")[0];
    return schedules.filter((schedule) => schedule.date === dateString);
  };

  // Add a function to sync daily schedules with weekly schedules
  const syncWeeklySchedules = () => {
    // Create a map to store the latest schedule for each day and truck
    const latestSchedules = {};

    // Process all schedules
    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      const dayIndex = scheduleDate.getDay();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[dayIndex];
      const key = `${dayName}_${schedule.truckId}`;

      // If we don't have this day+truck combo yet, or this schedule is newer
      if (
        !latestSchedules[key] ||
        new Date(schedule.date) > new Date(latestSchedules[key].date)
      ) {
        latestSchedules[key] = schedule;
      }
    });

    // Update weekly schedules based on the latest daily schedules
    Object.values(latestSchedules).forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      const dayIndex = scheduleDate.getDay();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[dayIndex];

      // Update weekly schedule
      updateWeeklySchedule(dayName, schedule.truckId, schedule.route);
    });
  };

  return (
    <div className="schedule">
      <Sidebar />
      <div className="scheduleContainer">
        <div className="scheduleTitle">Schedule Page</div>

        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <p>Loading schedule data from Firestore...</p>
            <p className="loading-details">Connecting to Firebase...</p>
          </div>
        ) : (
          <div className="schedule-content">
            <div className="main-content">
              <div className="card">
                <div className="card-header">
                  <h2>
                    Today's Schedule -{" "}
                    {date.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </h2>
                  <button
                    onClick={() => setShowAddScheduleForm(!showAddScheduleForm)}
                  >
                    {showAddScheduleForm ? "Cancel" : "Add New"}
                  </button>
                </div>
                {showAddScheduleForm && (
                  <div className="add-form">
                    <input
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) =>
                        setNewSchedule({ ...newSchedule, date: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Truck ID (e.g., 0001 or 0002)"
                      value={newSchedule.truckId}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          truckId: e.target.value,
                        })
                      }
                    />
                    <select
                      value={newSchedule.driver}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          driver: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.name}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Route"
                      value={newSchedule.route}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          route: e.target.value,
                        })
                      }
                    />
                    <div className="time-input-container">
                      <input
                        type="text"
                        ref={timeInputRef}
                        placeholder="Estimated Time"
                        value={newSchedule.estimatedTime}
                        onClick={() => {
                          // Initialize with a default time if empty
                          if (!newSchedule.estimatedTime) {
                            setNewSchedule({
                              ...newSchedule,
                              estimatedTime: "12:00 AM",
                            });
                          }
                          setShowTimePicker(true);
                        }}
                        readOnly
                      />
                      <span
                        className="time-icon"
                        onClick={() => {
                          if (!newSchedule.estimatedTime) {
                            setNewSchedule({
                              ...newSchedule,
                              estimatedTime: "12:00 AM",
                            });
                          }
                          setShowTimePicker(true);
                        }}
                      >
                        🕒
                      </span>
                      {showTimePicker && renderTimePicker()}
                    </div>
                    <button onClick={addSchedule}>Add Schedule</button>
                  </div>
                )}

                {getTodaySchedules().length === 0 ? (
                  <div className="no-data">No schedules for this date</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Truck ID</th>
                        <th>Driver</th>
                        <th>Route</th>
                        <th>Estimated Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTodaySchedules().map((schedule) => (
                        <tr key={schedule.id}>
                          <td>
                            <select
                              value={schedule.status || "Pending"}
                              onChange={(e) =>
                                updateScheduleStatus(
                                  schedule.id,
                                  e.target.value
                                )
                              }
                              className={`status-${(
                                schedule.status || "pending"
                              ).toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>{schedule.truckId}</td>
                          <td>{schedule.driver}</td>
                          <td>{schedule.route}</td>
                          <td>{schedule.estimatedTime}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => deleteSchedule(schedule.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="card">
                <h2>Scheduled Collection</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Truck 0001</th>
                      <th>Truck 0002</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(weeklySchedules).map(([day, trucks]) => (
                      <tr key={day}>
                        <td>{day}</td>
                        <td>{trucks.truck1?.route}</td>
                        <td>{trucks.truck2?.route}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sidebar-content">
              <div className="card">{renderCalendar()}</div>

              <div className="card">
                <div className="card-header">
                  <h2>Drivers</h2>
                  <button
                    onClick={() => setShowAddDriverForm(!showAddDriverForm)}
                  >
                    {showAddDriverForm ? "Cancel" : "Add Driver"}
                  </button>
                </div>
                {showAddDriverForm && (
                  <div className="add-form">
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={newDriver.name}
                      onChange={(e) =>
                        setNewDriver({ ...newDriver, name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Driver ID"
                      value={newDriver.id}
                      onChange={(e) =>
                        setNewDriver({ ...newDriver, id: e.target.value })
                      }
                    />
                    <button onClick={addDriver}>Add Driver</button>
                  </div>
                )}

                {drivers.length === 0 ? (
                  <div className="no-data">No drivers available</div>
                ) : (
                  <div className="driver-list">
                    {drivers.map((driver) => (
                      <div key={driver.id} className="driver-item">
                        <div className="avatar">
                          <img
                            src={driver.avatar || "/placeholder.svg"}
                            alt={driver.name}
                          />
                        </div>
                        <div>
                          <div className="driver-name">{driver.name}</div>
                          <div className="driver-id">{driver.id}</div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            console.log(
                              "🟡 Delete button clicked for ID:",
                              driver.id
                            );
                            deleteDriver(driver.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
