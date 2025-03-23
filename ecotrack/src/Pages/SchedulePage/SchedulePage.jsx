"use client"

import { useState, useEffect } from "react"
import Sidebar from "../../Components/Sidebar/Sidebar"
import Navbar from "../../Components/Navbar/Navbar"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getDatabase, ref, push, onValue, remove, update, get, set } from "firebase/database"
import "./SchedulePage.scss"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAafMRXyF5aQVXGA6vjk_arexvq1Mf2Xkw",
  authDomain: "ecotrack-web-panel.firebaseapp.com",
  projectId: "ecotrack-web-panel",
  storageBucket: "ecotrack-web-panel.appspot.com",
  messagingSenderId: "879072790810",
  appId: "1:879072790810:web:8a510c63c94958365904a3",
  databaseURL: "https://ecotrack-web-panel-default-rtdb.asia-southeast1.firebasedatabase.app (https://ecotrack-web-panel-default-rtdb.firebaseio.com/)",

}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);
console.log("Firebase initialized with database URL:", firebaseConfig.databaseURL)

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
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // Form state
  const [newDriver, setNewDriver] = useState({ name: "", id: "" })
  const [newSchedule, setNewSchedule] = useState({
    status: "Pending",
    truckId: "",
    driver: "",
    route: "",
    estimatedTime: "",
  })

  // Ensure the initializeEmptyData function is present and properly implemented
  const initializeEmptyData = async () => {
    try {
      console.log("Attempting to initialize empty data...")

      // Check if drivers node exists
      const driversRef = ref(database, "drivers")
      const driversSnapshot = await get(driversRef)
      console.log("Drivers node exists:", driversSnapshot.exists())

      if (!driversSnapshot.exists()) {
        console.log("Creating initial drivers data")
        // Create initial drivers data
        await set(driversRef, {
          driver1: {
            name: "Albert Brillantes",
            id: "D001",
            avatar: "/placeholder.svg",
          },
          driver2: {
            name: "Eric Lanto",
            id: "D002",
            avatar: "/placeholder.svg",
          },
        })
        console.log("Initial drivers data created successfully")
      }

      // Check if schedules node exists
      const schedulesRef = ref(database, "schedules")
      const schedulesSnapshot = await get(schedulesRef)
      console.log("Schedules node exists:", schedulesSnapshot.exists())

      if (!schedulesSnapshot.exists()) {
        console.log("Creating initial schedules data")
        // Create initial schedules data
        const today = new Date()
        const dateString = today.toISOString().split("T")[0]

        await set(schedulesRef, {
          schedule1: {
            status: "Pending",
            truckId: "0001",
            driver: "Albert Brillantes",
            route: "Burgos - Bondoc",
            estimatedTime: "9:00 AM",
            date: dateString,
          },
          schedule2: {
            status: "Completed",
            truckId: "0002",
            driver: "Eric Lanto",
            route: "Zamora-BFM-Floresca",
            estimatedTime: "10:00 AM",
            date: dateString,
          },
        })
        console.log("Initial schedules data created successfully")
      }

      console.log("Database initialization complete")
      return true
    } catch (error) {
      console.error("Error initializing data:", error)
      alert("Failed to initialize data: " + error.message)
      return false
    }
  }

  // Add more detailed error handling in the useEffect
  useEffect(() => {
    console.log("Starting to fetch data from Firebase")
    console.log("Database URL:", firebaseConfig.databaseURL)
    setLoading(true)

    try {
      // Test database connection
      console.log("Testing database connection...")
      try {
        const testRef = ref(database, ".info/connected")
        onValue(testRef, (snapshot) => {
          console.log("Firebase connection status:", snapshot.val() ? "connected" : "disconnected")
        })
      } catch (connErr) {
        console.error("Connection test failed:", connErr)
      }

      // Reference to drivers in Firebase
      const driversRef = ref(database, "drivers")
      console.log("Created drivers reference")

      // Listen for changes to drivers
      const driversUnsubscribe = onValue(
        driversRef,
        (snapshot) => {
          console.log("Drivers data received:", snapshot.exists())
          const data = snapshot.val()
          if (data) {
            const driversList = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
            }))
            setDrivers(driversList)
            console.log("Drivers loaded:", driversList.length)
          } else {
            console.log("No drivers data found")
            setDrivers([])
          }
        },
        (error) => {
          console.error("Error fetching drivers:", error)
          setError("Failed to load drivers. Please try again later.")
        },
      )

      // Reference to schedules in Firebase
      const schedulesRef = ref(database, "schedules")
      console.log("Created schedules reference")

      // Listen for changes to schedules
      const schedulesUnsubscribe = onValue(
        schedulesRef,
        (snapshot) => {
          console.log("Schedules data received:", snapshot.exists())
          const data = snapshot.val()
          let schedulesList = []

          if (data) {
            schedulesList = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
            }))
            console.log("Schedules loaded:", schedulesList.length)
          } else {
            console.log("No schedules data found")
          }

          setSchedules(schedulesList)

          // Process weekly schedules
          const weekly = {}
          ;["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
            weekly[day] = { truck1: { route: "" }, truck2: { route: "" } }
          })

          // Populate weekly schedules from data
          if (schedulesList.length > 0) {
            const today = new Date()
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)) // Start from Monday

            for (let i = 0; i < 7; i++) {
              const currentDate = new Date(startOfWeek)
              currentDate.setDate(startOfWeek.getDate() + i)
              const dateString = currentDate.toISOString().split("T")[0]
              const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]

              // Find schedules for this day
              const daySchedules = schedulesList.filter((schedule) => schedule.date === dateString)

              // Group by truck
              daySchedules.forEach((schedule) => {
                if (schedule.truckId === "0001") {
                  weekly[dayName].truck1.route = schedule.route
                } else if (schedule.truckId === "0002") {
                  weekly[dayName].truck2.route = schedule.route
                }
              })
            }
          }

          setWeeklySchedules(weekly)
          setLoading(false)
          console.log("Data loading complete")
        },
        (error) => {
          console.error("Error fetching schedules:", error)
          setError("Failed to load schedules. Please try again later.")
          setLoading(false)
        },
      )

      // Check if this is the first load
      Promise.all([get(ref(database, "drivers")), get(ref(database, "schedules"))])
        .then(([driversSnapshot, schedulesSnapshot]) => {
          const hasDrivers = driversSnapshot.exists()
          const hasSchedules = schedulesSnapshot.exists()
          setIsFirstLoad(!hasDrivers && !hasSchedules)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error checking initial data:", err)
          setLoading(false)
        })

      // Cleanup function to unsubscribe from Firebase listeners
      return () => {
        driversUnsubscribe()
        schedulesUnsubscribe()
        console.log("Firebase listeners unsubscribed")
      }
    } catch (err) {
      console.error("Error setting up Firebase:", err)
      setError("Failed to connect to the database. Please try again later.")
      setLoading(false)
    }
  }, [])

  // Add a new driver to Firebase
  const addDriver = async () => {
    if (!newDriver.name || !newDriver.id) {
      alert("Please fill in all driver fields")
      return
    }

    try {
      const driversRef = ref(database, "drivers")
      await push(driversRef, {
        ...newDriver,
        avatar: "/placeholder.svg", // Default avatar
      })

      // Reset form
      setNewDriver({ name: "", id: "" })
      setShowAddDriverForm(false)
    } catch (error) {
      console.error("Error adding driver:", error)
      alert("Failed to add driver. Please try again.")
    }
  }

  // Add a new schedule to Firebase
  const addSchedule = async () => {
    if (!newSchedule.truckId || !newSchedule.driver || !newSchedule.route || !newSchedule.estimatedTime) {
      alert("Please fill in all schedule fields")
      return
    }

    try {
      const schedulesRef = ref(database, "schedules")
      await push(schedulesRef, {
        ...newSchedule,
        date: date.toISOString().split("T")[0],
      })

      // Reset form
      setNewSchedule({
        status: "Pending",
        truckId: "",
        driver: "",
        route: "",
        estimatedTime: "",
      })
      setShowAddScheduleForm(false)
    } catch (error) {
      console.error("Error adding schedule:", error)
      alert("Failed to add schedule. Please try again.")
    }
  }

  // Delete a schedule from Firebase
  const deleteSchedule = async (scheduleId) => {
    try {
      const scheduleRef = ref(database, `schedules/${scheduleId}`)
      await remove(scheduleRef)
    } catch (error) {
      console.error("Error deleting schedule:", error)
      alert("Failed to delete schedule. Please try again.")
    }
  }

  // Update a schedule status
  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      const scheduleRef = ref(database, `schedules/${scheduleId}`)
      await update(scheduleRef, { status: newStatus })
    } catch (error) {
      console.error("Error updating schedule status:", error)
      alert("Failed to update schedule status. Please try again.")
    }
  }

  // Update weekly schedule
  const updateWeeklySchedule = async (day, truckId, newRoute) => {
    try {
      // Find schedules for this day
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)) // Start from Monday

      const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day)
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + dayIndex)
      const dateString = currentDate.toISOString().split("T")[0]

      // Check if there's already a schedule for this truck on this day
      const existingSchedule = schedules.find(
        (schedule) => schedule.date === dateString && schedule.truckId === truckId,
      )

      if (existingSchedule) {
        // Update existing schedule
        const scheduleRef = ref(database, `schedules/${existingSchedule.id}`)
        await update(scheduleRef, { route: newRoute })
      } else {
        // Create new schedule
        const schedulesRef = ref(database, "schedules")
        await push(schedulesRef, {
          status: "Pending",
          truckId: truckId,
          driver: "", // You might want to assign a default driver
          route: newRoute,
          estimatedTime: "",
          date: dateString,
        })
      }
    } catch (error) {
      console.error("Error updating weekly schedule:", error)
      alert("Failed to update weekly schedule. Please try again.")
    }
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
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i)
      const isSelected = currentDate.toDateString() === date.toDateString()
      const isToday = currentDate.toDateString() === new Date().toDateString()

      // Check if there are schedules for this day
      const dateString = currentDate.toISOString().split("T")[0]
      const hasSchedules = schedules.some((schedule) => schedule.date === dateString)

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${hasSchedules ? "has-schedules" : ""}`}
          onClick={() => setDate(currentDate)}
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
    )
  }

  // Get today's schedules
  const getTodaySchedules = () => {
    const dateString = date.toISOString().split("T")[0]
    return schedules.filter((schedule) => schedule.date === dateString)
  }

  // Let's also add a fallback to initialize the database even if no data exists yet
  // Add this function after the useEffect

  // Add a button to initialize data
  const InitializeDataButton = () => (
    <div className="initialize-data">
      <p>No data found in the database. Would you like to create initial data?</p>
      <button onClick={initializeEmptyData}>Initialize Database</button>
    </div>
  )

  // First time setup guide component
  const FirstTimeSetupGuide = () => (
    <div className="first-time-setup">
      <h2>Welcome to Schedule Management!</h2>
      <p>It looks like this is your first time using the application. Let's set up your data:</p>

      <div className="setup-steps">
        <div className="setup-step">
          <h3>Step 1: Add Drivers</h3>
          <p>Start by adding drivers who will be assigned to schedules.</p>
          <div className="add-form">
            <input
              type="text"
              placeholder="Driver Name"
              value={newDriver.name}
              onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Driver ID"
              value={newDriver.id}
              onChange={(e) => setNewDriver({ ...newDriver, id: e.target.value })}
            />
            <button onClick={addDriver}>Add Driver</button>
          </div>
        </div>

        {drivers.length > 0 && (
          <div className="setup-step">
            <h3>Step 2: Create Your First Schedule</h3>
            <p>Now, let's create a schedule for today ({date.toLocaleDateString()}).</p>
            <div className="add-form">
              <input
                type="text"
                placeholder="Truck ID (e.g., 0001)"
                value={newSchedule.truckId}
                onChange={(e) => setNewSchedule({ ...newSchedule, truckId: e.target.value })}
              />
              <select
                value={newSchedule.driver}
                onChange={(e) => setNewSchedule({ ...newSchedule, driver: e.target.value })}
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
                placeholder="Route (e.g., Burgos - Bondoc)"
                value={newSchedule.route}
                onChange={(e) => setNewSchedule({ ...newSchedule, route: e.target.value })}
              />
              <input
                type="text"
                placeholder="Estimated Time (e.g., 9:00 AM)"
                value={newSchedule.estimatedTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, estimatedTime: e.target.value })}
              />
              <button onClick={addSchedule}>Add Schedule</button>
            </div>
          </div>
        )}

        {schedules.length > 0 && (
          <div className="setup-step success">
            <h3>Great job! You're all set up!</h3>
            <p>
              You've successfully created your first driver and schedule. You can continue adding more or start using
              the application.
            </p>
            <button onClick={() => setIsFirstLoad(false)}>Start Using the Application</button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="schedule">
      <Sidebar />
      <div className="scheduleContainer">
        <Navbar />
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
            <p>Loading schedule data...</p>
            <p className="loading-details">Connecting to: {firebaseConfig.databaseURL}</p>
          </div>
        ) : isFirstLoad && (drivers.length === 0 || schedules.length === 0) ? (
          <FirstTimeSetupGuide />
        ) : (
          <div className="schedule-content">
            <div className="main-content">
              <div className="card">
                <div className="card-header">
                  <h2>Today's Schedule - {date.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}</h2>
                  <button onClick={() => setShowAddScheduleForm(!showAddScheduleForm)}>
                    {showAddScheduleForm ? "Cancel" : "Add New"}
                  </button>
                </div>
                {showAddScheduleForm && (
                  <div className="add-form">
                    <input
                      type="text"
                      placeholder="Truck ID"
                      value={newSchedule.truckId}
                      onChange={(e) => setNewSchedule({ ...newSchedule, truckId: e.target.value })}
                    />
                    <select
                      value={newSchedule.driver}
                      onChange={(e) => setNewSchedule({ ...newSchedule, driver: e.target.value })}
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
                      onChange={(e) => setNewSchedule({ ...newSchedule, route: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Estimated Time"
                      value={newSchedule.estimatedTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, estimatedTime: e.target.value })}
                    />
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
                          <td>{schedule.truckId}</td>
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

              <div className="card">
                <h2>Weekly Schedule</h2>
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
                        <td>
                          <input
                            type="text"
                            value={trucks.truck1.route}
                            onChange={(e) => {
                              // Update local state immediately for responsive UI
                              setWeeklySchedules({
                                ...weeklySchedules,
                                [day]: {
                                  ...weeklySchedules[day],
                                  truck1: { route: e.target.value },
                                },
                              })
                              // Debounce the Firebase update to avoid too many writes
                              if (e.target.value !== trucks.truck1.route) {
                                const timeoutId = setTimeout(() => {
                                  updateWeeklySchedule(day, "0001", e.target.value)
                                }, 500)
                                return () => clearTimeout(timeoutId)
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={trucks.truck2.route}
                            onChange={(e) => {
                              // Update local state immediately for responsive UI
                              setWeeklySchedules({
                                ...weeklySchedules,
                                [day]: {
                                  ...weeklySchedules[day],
                                  truck2: { route: e.target.value },
                                },
                              })
                              // Debounce the Firebase update to avoid too many writes
                              if (e.target.value !== trucks.truck2.route) {
                                const timeoutId = setTimeout(() => {
                                  updateWeeklySchedule(day, "0002", e.target.value)
                                }, 500)
                                return () => clearTimeout(timeoutId)
                              }
                            }}
                          />
                        </td>
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
                  <button onClick={() => setShowAddDriverForm(!showAddDriverForm)}>
                    {showAddDriverForm ? "Cancel" : "Add Driver"}
                  </button>
                </div>
                {showAddDriverForm && (
                  <div className="add-form">
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Driver ID"
                      value={newDriver.id}
                      onChange={(e) => setNewDriver({ ...newDriver, id: e.target.value })}
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
                          <img src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                        </div>
                        <div>
                          <div className="driver-name">{driver.name}</div>
                          <div className="driver-id">{driver.id}</div>
                        </div>
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
  )
}

export default SchedulePage

