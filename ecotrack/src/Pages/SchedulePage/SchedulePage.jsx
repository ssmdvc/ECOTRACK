"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "../../Components/Sidebar/Sidebar"
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "../../firebase.js" // Import Firestore instance from firebase.js
import "./SchedulePage.scss"

const SchedulePage = () => {
  // State management
  const [date, setDate] = useState(new Date())
  const [drivers, setDrivers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [weeklySchedules, setWeeklySchedules] = useState({})
  const [showAddDriverForm, setShowAddDriverForm] = useState(false)
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState(false)
  const [formData, setFormData] = useState({})
  const [showArchivedDrivers, setShowArchivedDrivers] = useState(false)
  // Add a new state for tracking the selected week
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week, -1 = last week, 1 = next week, etc.

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDriver(null)
    setArchiveConfirm(false)
  }

  const handleArchiveConfirm = () => {
    setArchiveConfirm(true)
  }

  const handleCancelArchive = () => {
    setArchiveConfirm(false)
  }

  const handleArchive = () => {
    if (!selectedDriver) return

    // Update the driver status in local state only
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.id === selectedDriver.id
          ? { ...driver, status: "Archived", archivedAt: new Date().toISOString() }
          : driver,
      ),
    )

    // Close the modal
    setSelectedDriver(null)
    setShowModal(false)
    setArchiveConfirm(false)

    alert("Driver archived successfully.")
  }

  // Time picker refs
  const timePickerRef = useRef(null)
  const timeInputRef = useRef(null)

  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]

  // Form state
  const [newDriver, setNewDriver] = useState({ name: "", id: "" })
  const [newSchedule, setNewSchedule] = useState({
    status: "Pending",
    truckId: "",
    driver: "",
    route: "",
    estimatedTime: "",
    date: localDate,
  })

  // Initialize schedule collection structure
  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const initialWeeklySchedules = {}

    days.forEach((day) => {
      initialWeeklySchedules[day] = {
        truck1: { route: "" },
        truck2: { route: "" },
      }
    })

    setWeeklySchedules(initialWeeklySchedules)
  }, [])

  // Handle clicks outside the time picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target) &&
        timeInputRef.current &&
        !timeInputRef.current.contains(event.target)
      ) {
        setShowTimePicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [timePickerRef])

  // Fetch data from Firestore on component mount
  useEffect(() => {
    console.log("Starting to fetch data from Firestore")
    setLoading(true)

    try {
      // Set up listeners for drivers collection
      const driversUnsubscribe = onSnapshot(
        collection(db, "drivers"),
        (snapshot) => {
          console.log("Drivers data received:", !snapshot.empty)
          const driversList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setDrivers(driversList)
          console.log("Drivers loaded:", driversList.length)
        },
        (error) => {
          console.error("Error fetching drivers:", error)
          setError("Failed to load drivers. Please try again later.")
        },
      )

      // Set up listeners for schedules collection
      const schedulesUnsubscribe = onSnapshot(
        collection(db, "schedules"),
        (snapshot) => {
          console.log("Schedules data received:", !snapshot.empty)
          const schedulesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setSchedules(schedulesList)
          console.log("Schedules loaded:", schedulesList.length)
        },
        (error) => {
          console.error("Error fetching schedules:", error)
          setError("Failed to load schedules. Please try again later.")
          setLoading(false)
        },
      )

      // Set up listeners for weekly schedules collection
      const weeklySchedulesUnsubscribe = onSnapshot(
        collection(db, "weeklySchedules"),
        (snapshot) => {
          console.log("Weekly schedules data received:", !snapshot.empty)

          // Initialize with empty values
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          const weekly = {}
          days.forEach((day) => {
            weekly[day] = { truck1: { route: "" }, truck2: { route: "" } }
          })

          // Fill with data from Firestore
          snapshot.docs.forEach((doc) => {
            const data = doc.data()
            if (weekly[data.day]) {
              if (data.truckId === "0001") {
                weekly[data.day].truck1.route = data.route || ""
              } else if (data.truckId === "0002") {
                weekly[data.day].truck2.route = data.route || ""
              }
            }
          })

          setWeeklySchedules(weekly)
          setLoading(false)
          console.log("Weekly schedules loaded")
        },
        (error) => {
          console.error("Error fetching weekly schedules:", error)
          setError("Failed to load weekly schedules. Please try again later.")
          setLoading(false)
        },
      )

      // Cleanup function to unsubscribe from Firestore listeners
      return () => {
        driversUnsubscribe()
        schedulesUnsubscribe()
        weeklySchedulesUnsubscribe()
        console.log("Firestore listeners unsubscribed")
      }
    } catch (err) {
      console.error("Error setting up Firestore:", err)
      setError("Failed to connect to the database. Please try again later.")
      setLoading(false)
    }
  }, [])

  // Add a new driver to Firestore
  const addDriver = async () => {
    if (!newDriver.name || !newDriver.id) {
      alert("Please fill in all driver fields")
      return
    }

    try {
      await addDoc(collection(db, "drivers"), {
        ...newDriver,
        status: "Active",
        avatar: "/placeholder.svg", // Default avatar
        createdAt: new Date().toISOString(),
      })

      // Reset form
      setNewDriver({ name: "", id: "" })
      setShowAddDriverForm(false)
    } catch (error) {
      console.error("Error adding driver:", error)
      alert("Failed to add driver. Please try again.")
    }
  }

  // Add a new schedule to Firestore
  const addSchedule = async () => {
    if (!newSchedule.truckId || !newSchedule.driver || !newSchedule.route || !newSchedule.estimatedTime) {
      alert("Please fill in all schedule fields")
      return
    }

    try {
      // Add to schedules collection
      await addDoc(collection(db, "schedules"), {
        ...newSchedule,
      })

      // Also update weekly schedule
      // First, determine the day of week from the selected date
      const scheduleDate = new Date(newSchedule.date)
      const dayIndex = scheduleDate.getDay()
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayName = days[dayIndex]

      // Update the weekly schedule for this day and truck
      await updateWeeklySchedule(dayName, newSchedule.truckId, newSchedule.route)

      // Reset form
      setNewSchedule({
        status: "Pending",
        truckId: "",
        driver: "",
        route: "",
        estimatedTime: "",
        date: localDate,
      })
      setShowAddScheduleForm(false)
    } catch (error) {
      console.error("Error adding schedule:", error)
      alert("Failed to add schedule. Please try again.")
    }
  }

  // Delete a schedule from Firestore
  const deleteSchedule = async (scheduleId) => {
    try {
      // Get the schedule before deleting it
      const scheduleToDelete = schedules.find((s) => s.id === scheduleId)

      // Delete from schedules collection
      await deleteDoc(doc(db, "schedules", scheduleId))

      // If this is the only schedule for this day and truck, also update weekly schedule
      if (scheduleToDelete) {
        const scheduleDate = new Date(scheduleToDelete.date)
        const dayIndex = scheduleDate.getDay()
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const dayName = days[dayIndex]

        // Check if there are other schedules for this day and truck
        const otherSchedulesForSameDayAndTruck = schedules.filter(
          (s) =>
            s.id !== scheduleId && s.truckId === scheduleToDelete.truckId && new Date(s.date).getDay() === dayIndex,
        )

        // If no other schedules, clear the weekly schedule entry
        if (otherSchedulesForSameDayAndTruck.length === 0) {
          await updateWeeklySchedule(dayName, scheduleToDelete.truckId, "")
        }
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      alert("Failed to delete schedule. Please try again.")
    }
  }

  // Update a schedule status in Firestore
  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      await updateDoc(doc(db, "schedules", scheduleId), {
        status: newStatus,
      })
    } catch (error) {
      console.error("Error updating schedule status:", error)
      alert("Failed to update schedule status. Please try again.")
    }
  }

  // Update weekly schedule in Firestore
  const updateWeeklySchedule = async (day, truckId, newRoute) => {
    try {
      // Create a unique ID for the weekly schedule entry
      const docId = `${day}_${truckId}`

      // Reference to the document
      const weeklyScheduleRef = doc(db, "weeklySchedules", docId)

      // Set the document with merge option to update if exists or create if not
      await setDoc(
        weeklyScheduleRef,
        {
          day,
          truckId,
          route: newRoute,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

      console.log(`Updated weekly schedule for ${day}, truck ${truckId}`)
    } catch (error) {
      console.error("Error updating weekly schedule:", error)
      alert("Failed to update weekly schedule. Please try again.")
    }
  }

  // Handle time selection
  const handleTimeSelect = (hours, minutes, period) => {
    const formattedTime = `${hours}:${minutes} ${period}`
    setNewSchedule({ ...newSchedule, estimatedTime: formattedTime })
    // Keep the picker open to allow for adjustments
  }

  // Render time picker
  const renderTimePicker = () => {
    const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
    const minutes = ["00", "15", "30", "45"]
    const periods = ["AM", "PM"]

    // Parse current time values
    const timeRegex = /^(\d+):(\d+)\s(AM|PM)$/
    const currentTime = newSchedule.estimatedTime || "12:00 AM"
    const match = currentTime.match(timeRegex)

    const currentHour = match ? Number.parseInt(match[1]) : 12
    const currentMinute = match ? match[2] : "00"
    const currentPeriod = match ? match[3] : "AM"

    return (
      <div className="time-picker" ref={timePickerRef}>
        <div className="time-picker-header">
          <h3>Select Time</h3>
          <button className="close-btn" onClick={() => setShowTimePicker(false)}>
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
                  className={`time-item ${hour === currentHour ? "selected" : ""}`}
                  onClick={() => {
                    handleTimeSelect(hour, currentMinute, currentPeriod)
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
                  className={`time-item ${minute === currentMinute ? "selected" : ""}`}
                  onClick={() => {
                    handleTimeSelect(currentHour, minute, currentPeriod)
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
                  className={`time-item ${period === currentPeriod ? "selected" : ""}`}
                  onClick={() => {
                    handleTimeSelect(currentHour, currentMinute, period)
                  }}
                >
                  {period}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
    ]
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

    let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    firstDayOfMonth = (firstDayOfMonth + 6) % 7 // makes Monday the first day

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i)
      const getLocalDateString = (d) =>
        new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0]

      const isSelected = currentDate.toDateString() === date.toDateString()
      const isToday = currentDate.toDateString() === new Date().toDateString()

      // Check if there are schedules for this day
      const dateString = getLocalDateString(currentDate)
      const hasSchedules = schedules.some((schedule) => schedule.date === dateString)

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          } ${hasSchedules ? "has-schedules" : ""}`}
          onClick={() => {
            setDate(currentDate)
            setNewSchedule((prev) => ({
              ...prev,
              date: getLocalDateString(currentDate), // sync the form with the selected date
            }))
          }}
        >
          {i}
        </div>,
      )
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>&lt;</button>
          <div>
            {monthNames[date.getMonth()]} {date.getFullYear()}
          </div>
          <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>&gt;</button>
        </div>
        <div className="calendar-days">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
          {days}
        </div>
      </div>
    )
  }

  const getLocalDateString = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0]

  const getTodaySchedules = () => {
    const dateString = getLocalDateString(date)
    return schedules.filter((schedule) => schedule.date === dateString)
  }

  // Modify the formatDateRange function to use the selectedWeek
  const formatDateRange = () => {
    // Get current date
    const now = new Date()

    // Get Monday of current week
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))

    // Adjust for selected week
    monday.setDate(monday.getDate() + selectedWeek * 7)

    // Get Sunday of the selected week
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    // Format dates
    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }

    return `${formatDate(monday)} - ${formatDate(sunday)}`
  }

  // Add a function to get schedules for the selected week
  const getWeekSchedules = () => {
    // Get current date
    const now = new Date()

    // Get Monday of current week
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))

    // Adjust for selected week
    monday.setDate(monday.getDate() + selectedWeek * 7)

    // Get Sunday of the selected week
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    // Filter schedules for the selected week
    const weekSchedules = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return scheduleDate >= monday && scheduleDate <= sunday
    })

    // Create a weekly schedule structure based on filtered schedules
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const weeklyData = {}

    days.forEach((day) => {
      weeklyData[day] = { truck1: { route: "" }, truck2: { route: "" } }
    })

    // Fill with data from filtered schedules
    weekSchedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date)
      const dayIndex = scheduleDate.getDay()
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1] // Convert Sunday (0) to index 6

      if (schedule.truckId === "0001") {
        weeklyData[dayName].truck1.route = schedule.route || ""
      } else if (schedule.truckId === "0002") {
        weeklyData[dayName].truck2.route = schedule.route || ""
      }
    })

    return weeklyData
  }

  const syncWeeklySchedules = () => {
    // Create a map to store the latest schedule for each day and truck
    const latestSchedules = {}

    // Get the current date and week number
    const getWeekNumber = (date) => {
      const startDate = new Date(date.getFullYear(), 0, 1)
      const diff = date - startDate
      const oneDay = 1000 * 60 * 60 * 24
      const weekNumber = Math.ceil(diff / oneDay / 7)
      return weekNumber
    }

    // Get current week
    const currentWeek = getWeekNumber(new Date())

    // Process all schedules
    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date)
      const scheduleWeek = getWeekNumber(scheduleDate)

      // Only consider schedules for the current week
      if (scheduleWeek === currentWeek) {
        const dayIndex = scheduleDate.getDay()
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const dayName = days[dayIndex]
        const key = `${dayName}_${schedule.truckId}`

        if (!latestSchedules[key] || new Date(schedule.date) > new Date(latestSchedules[key].date)) {
          latestSchedules[key] = schedule
        }
      }
    })

    // Update weekly schedules based on the latest daily schedules for the current week
    Object.values(latestSchedules).forEach((schedule) => {
      const scheduleDate = new Date(schedule.date)
      const dayIndex = scheduleDate.getDay()
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayName = days[dayIndex]

      // Update weekly schedule
      updateWeeklySchedule(dayName, schedule.truckId, schedule.route)
    })
  }

  // Check for week changes and refresh the schedule
  useEffect(() => {
    // Function to check if the week has changed
    const checkForWeekChange = () => {
      // Get the current week number
      const getWeekNumber = (date) => {
        const startDate = new Date(date.getFullYear(), 0, 1)
        const diff = date - startDate
        const oneDay = 1000 * 60 * 60 * 24
        const weekNumber = Math.ceil(diff / oneDay / 7)
        return weekNumber
      }

      const currentWeek = getWeekNumber(new Date())

      // Get the stored week number from localStorage
      const storedWeek = localStorage.getItem("currentWeek")

      // If the week has changed or no week is stored, update and refresh
      if (!storedWeek || Number.parseInt(storedWeek) !== currentWeek) {
        // Store the new week number
        localStorage.setItem("currentWeek", currentWeek.toString())

        // Refresh the weekly schedule
        syncWeeklySchedules()

        console.log("Week changed, refreshed weekly schedule")
      }
    }

    // Check immediately when component mounts
    checkForWeekChange()

    // Set up a daily check (runs once per day)
    const intervalId = setInterval(checkForWeekChange, 86400000) // 24 hours

    return () => clearInterval(intervalId)
  }, [schedules])

  // Get active and archived drivers
  const activeDrivers = drivers.filter((driver) => driver.status !== "Archived")
  const archivedDrivers = drivers.filter((driver) => driver.status === "Archived")

  return (
    <div className="schedule">
      <Sidebar />
      <div className="scheduleContainer">
        <div className="scheduleTitle">Schedule Management</div>

        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading"></div>
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
                  <button onClick={() => setShowAddScheduleForm(!showAddScheduleForm)}>
                    {showAddScheduleForm ? "Cancel" : "Add New"}
                  </button>
                </div>
                {showAddScheduleForm && (
                  <div className="add-form">
                    <input
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    />
                    <select
                      value={newSchedule.truckId}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          truckId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Truck ID</option>
                      <option value="0001">0001</option>
                      <option value="0002">0002</option>
                    </select>

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
                      {activeDrivers.map((driver) => (
                        <option key={driver.id} value={driver.name}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newSchedule.route}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          route: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Route</option>
                      <option value="Monark">Monark</option>
                      <option value="Cristeta">Cristeta</option>
                      <option value="Facoma">Facoma</option>
                      <option value="Florante">Florante</option>
                      <option value="Selya">Selya</option>
                      <option value="Antenor">Antenor</option>
                      <option value="Burgos">Burgos</option>
                      <option value="Bondoc">Bondoc</option>
                      <option value="Zamora">Zamora</option>
                      <option value="RMF">RMF</option>
                      <option value="Floresca">Floresca</option>
                      <option value="Centraza">Centraza</option>
                      <option value="Manggahan">Manggahan</option>
                      <option value="Salvador Comp.">Salvador Comp.</option>
                      <option value="Balagtas">Balagtas</option>
                      <option value="Puhora">Puhora</option>
                    </select>
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
                            })
                          }
                          setShowTimePicker(true)
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
                            })
                          }
                          setShowTimePicker(true)
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
                              onChange={(e) => updateScheduleStatus(schedule.id, e.target.value)}
                              className={`status-${(schedule.status || "pending").toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>{schedule.id}</td>
                          <td>{schedule.driver}</td>
                          <td>{schedule.route}</td>
                          <td>{schedule.estimatedTime}</td>
                          <td>
                            <button className="delete-btn" onClick={() => deleteSchedule(schedule.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="card weekly-schedule-card">
                <div className="card-header">
                  <h2>Scheduled Collection</h2>
                  <div className="week-navigation">
                    <button onClick={() => setSelectedWeek(selectedWeek - 1)} className="week-nav-btn">
                      &lt; Previous Week
                    </button>
                    <span className="current-week-label">
                      {selectedWeek === 0
                        ? "Current Week"
                        : selectedWeek < 0
                          ? `${Math.abs(selectedWeek)} Week${Math.abs(selectedWeek) > 1 ? "s" : ""} Ago`
                          : `${selectedWeek} Week${selectedWeek > 1 ? "s" : ""} From Now`}
                    </span>
                    <button onClick={() => setSelectedWeek(selectedWeek + 1)} className="week-nav-btn">
                      Next Week &gt;
                    </button>
                  </div>
                  <div className="week-date-range">{formatDateRange()}</div>
                  {selectedWeek !== 0 && (
                    <button onClick={() => setSelectedWeek(0)} className="return-current-btn">
                      Return to Current Week
                    </button>
                  )}
                </div>
                <table className="weekly-schedule-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Truck 0001</th>
                      <th>Truck 0002</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(getWeekSchedules()).map(([day, trucks]) => (
                      <tr
                        key={day}
                        className={(() => {
                          // Only highlight current day if we're viewing the current week
                          if (selectedWeek !== 0) return ""

                          const now = new Date()
                          const dayIndex = now.getDay()
                          const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1
                          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                          const today = days[adjustedDayIndex]
                          return day === today ? "current-day" : ""
                        })()}
                      >
                        <td>{day}</td>
                        <td>{trucks.truck1?.route || "-"}</td>
                        <td>{trucks.truck2?.route || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sidebar-content">
              <div className="card">{renderCalendar()}</div>
              <div className="drivers-container">
                <div className="drivers-card">
                  <div className="drivers-header">
                    <h2>Drivers</h2>
                    <div className="driver-actions">
                      <button onClick={() => setShowAddDriverForm(!showAddDriverForm)} className="add-driver-btn">
                        {showAddDriverForm ? "Cancel" : "Add Driver"}
                      </button>
                      <button
                        onClick={() => setShowArchivedDrivers(!showArchivedDrivers)}
                        className="toggle-archived-btn"
                      >
                        {showArchivedDrivers ? "Show Active" : "Show Archived"}
                      </button>
                    </div>
                  </div>

                  {showAddDriverForm && (
                    <div className="modal-overlay" onClick={() => setShowAddDriverForm(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h2>Add New Driver</h2>
                          <button className="close-btn" onClick={() => setShowAddDriverForm(false)}>
                            ×
                          </button>
                        </div>
                        <div className="modal-body">
                          <div className="add-form">
                            <div className="form-group">
                              <label>Driver Name</label>
                              <input
                                type="text"
                                placeholder="Driver Name"
                                value={newDriver.name}
                                onChange={(e) =>
                                  setNewDriver({
                                    ...newDriver,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>Vehicle ID</label>
                              <input
                                type="text"
                                placeholder="Vehicle ID"
                                value={newDriver.id}
                                onChange={(e) =>
                                  setNewDriver({
                                    ...newDriver,
                                    id: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <button className="save-btn" onClick={addDriver}>
                              Add Driver
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="drivers-list">
                    {/* Show either active or archived drivers based on toggle */}
                    {(showArchivedDrivers ? archivedDrivers : activeDrivers).map((driver) => (
                      <div key={driver.id} className="driver-item">
                        <div className="driver-info">
                          <img
                            src={
                              driver.imageUrl ||
                              `/placeholder.svg?height=40&width=40` ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={driver.name}
                            className="driver-image"
                          />
                          <div className="driver-details">
                            <h3>{driver.name}</h3>
                            <p>{driver.driverId}</p>
                            {driver.status === "Archived" && <span className="archived-badge">Archived</span>}
                          </div>
                        </div>
                        <button className="view-btn" onClick={() => handleViewDriver(driver)}>
                          View
                        </button>
                      </div>
                    ))}

                    {/* Show message if no drivers in the selected category */}
                    {(showArchivedDrivers ? archivedDrivers.length === 0 : activeDrivers.length === 0) && (
                      <div className="no-data">
                        {showArchivedDrivers ? "No archived drivers found" : "No active drivers found"}
                      </div>
                    )}
                  </div>
                </div>

                {showModal && selectedDriver && (
                  <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h2>Driver Details</h2>
                        <button className="close-btn" onClick={closeModal}>
                          ×
                        </button>
                      </div>
                      <div className="modal-body">
                        {archiveConfirm ? (
                          <div className="archive-confirmation">
                            <h3>Are you sure you want to archive this driver?</h3>
                            <p>This action cannot be undone.</p>
                            <div className="archive-actions"></div>
                          </div>
                        ) : (
                          <div className="driver-profile">
                            <img
                              src={
                                selectedDriver.imageUrl ||
                                `/placeholder.svg?height=100&width=100` ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={selectedDriver.name}
                              className="driver-profile-image"
                            />
                            <div className="driver-profile-info">
                              <h3>{selectedDriver.name}</h3>
                              <p>
                                <strong>VehicleID:</strong> {selectedDriver.id || "N/A"}
                              </p>
                              <p>
                                <strong>Status:</strong> {selectedDriver.status || "Active"}
                              </p>
                              {selectedDriver.archivedAt && (
                                <p>
                                  <strong>Archived on:</strong>{" "}
                                  {new Date(selectedDriver.archivedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="modal-footer">
                        {archiveConfirm ? (
                          <div className="footer-buttons">
                            <button className="cancel-btn" onClick={handleCancelArchive}>
                              Cancel
                            </button>
                            <button className="archive-confirm-btn" onClick={handleArchive}>
                              Confirm Archive
                            </button>
                          </div>
                        ) : (
                          <div className="footer-buttons">
                            {selectedDriver.status !== "Archived" && (
                              <button className="archive-btn" onClick={handleArchiveConfirm}>
                                Archive
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchedulePage
