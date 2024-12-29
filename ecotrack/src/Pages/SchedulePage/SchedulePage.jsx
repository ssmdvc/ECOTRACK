import './SchedulePage.scss'
import { useState, useEffect } from "react";
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";

const SchedulePage = () => {

  const theme = useTheme();
  const [currentEvents, setCurrentEvents] = useState([]);


  const handleDateClick = (selected) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${selected.event.title}'`
      )
    ) {
      selected.event.remove();
    }
  };

  return (
    <div className="schedule">
      <Sidebar />
      <div className="scheduleContainer"> 
        <Navbar /> 
      <div className='scheduleTitle'>
           Schedule Management
      </div>
        <Box m="10px">
          <Box display="flex" justifyContent="space-between">
            {/* CALENDAR SIDEBAR */}
            <Box
              flex="1 1 5px"  // Reduced the width of the sidebar
              p="10px"
              borderRadius="4px"
            >
              <Typography variant="h6">Events</Typography>
              <List>
                {currentEvents.map((event) => (
                  <ListItem
                    key={event.id}
                    sx={{
                      margin: "10px 0",
                      borderRadius: "2px",
                    }}
                  >
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Typography>
                          {formatDate(event.start, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* CALENDAR */}
            <Box flex="1 1 40%" 
              ml="5px" 
              sx={{
              border: "2px solid #ccc", // Add a border with color and thickness
              borderRadius: "8px",       // Optional: Add rounded corners
              padding: "10px",           // Optional: Add some padding inside the box
            }}>  
              <FullCalendar
                height="70vh" 
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                }}
                initialView="dayGridMonth"
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                select={handleDateClick}
                eventClick={handleEventClick}
                eventsSet={(events) => setCurrentEvents(events)}
                initialEvents={[
                  {
                    id: "12315",
                    title: "All-day event",
                    date: "2022-09-14",
                  },
                  {
                    id: "5123",
                    title: "Timed event",
                    date: "2022-09-28",
                  },
                ]}
              />
            </Box>
          </Box>
        </Box>
        
      </div> 
    </div> 
  );
};

export default SchedulePage;
