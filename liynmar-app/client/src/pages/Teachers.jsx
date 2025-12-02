import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { teacherService } from '../services/teacherService';
import './Teachers.css';

const Teachers = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  
  const { data: teachers, isLoading, error } = useQuery('teachers', teacherService.getAll);

  // Sample data for demonstration
  const sampleTeachers = [
    {
      _id: '1',
      name: 'Sarah Johnson',
      subject: 'Mathematics',
      email: 'sarah.johnson@liynmar.com',
      phone: '+63 912 345 6789',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      usualTime: '2:00 PM - 8:00 PM',
      status: 'available',
      rating: 4.9,
      bookedDays: ['Wednesday'],
    },
    {
      _id: '2',
      name: 'Michael Chen',
      subject: 'Physics',
      email: 'michael.chen@liynmar.com',
      phone: '+63 912 345 6790',
      daysAvailable: ['Monday', 'Wednesday', 'Friday'],
      usualTime: '3:00 PM - 7:00 PM',
      status: 'unavailable',
      rating: 4.8,
      bookedDays: ['Monday', 'Wednesday', 'Friday'],
    },
    {
      _id: '3',
      name: 'Emily Santos',
      subject: 'English',
      email: 'emily.santos@liynmar.com',
      phone: '+63 912 345 6791',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      usualTime: '1:00 PM - 6:00 PM',
      status: 'available',
      rating: 4.9,
      bookedDays: ['Tuesday', 'Thursday'],
    },
    {
      _id: '4',
      name: 'David Martinez',
      subject: 'Chemistry',
      email: 'david.martinez@liynmar.com',
      phone: '+63 912 345 6792',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      usualTime: '4:00 PM - 9:00 PM',
      status: 'available',
      rating: 4.7,
      bookedDays: [],
    },
    {
      _id: '5',
      name: 'Lisa Wong',
      subject: 'Biology',
      email: 'lisa.wong@liynmar.com',
      phone: '+63 912 345 6793',
      daysAvailable: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      usualTime: '2:00 PM - 7:00 PM',
      status: 'available',
      rating: 4.8,
      bookedDays: ['Tuesday', 'Wednesday', 'Thursday'],
    },
  ];

  const teachersData = teachers || sampleTeachers;

  // Filter teachers based on header search query
  const filteredTeachers = teachersData.filter((teacher) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.subject.toLowerCase().includes(query) ||
      teacher.usualTime.toLowerCase().includes(query) ||
      teacher.daysAvailable.some((day) => day.toLowerCase().includes(query))
    );
  });

  const getDayBadge = (day, teacher) => {
    const dayShort = day.substring(0, 2);
    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][
      ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'].indexOf(dayShort)
    ];

    const isTeachingDay = teacher.daysAvailable.some(d => d.startsWith(dayName));
    const isBooked = teacher.bookedDays.some(d => d.startsWith(dayName));

    let className = 'day-badge ';
    let title = '';

    if (!isTeachingDay) {
      className += 'not-available';
      title = 'Not teaching this day';
    } else if (isBooked) {
      className += 'booked';
      title = 'Booked';
    } else {
      className += 'available';
      title = 'Available';
    }

    return (
      <span className={className} title={title}>
        {dayShort}
      </span>
    );
  };

  return (
    <div className="teachers-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Teachers Management</h2>
          <p className="page-subtitle">Manage and monitor all teaching staff</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary">
            <i className="fas fa-plus"></i> Add Teacher
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Teachers</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Major Subject</th>
                <th>Available Days</th>
                <th>Available Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="teacher-row">
                  <td>
                    <div className="teacher-cell">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=8B7355&color=fff`}
                        alt={teacher.name}
                      />
                      <span>{teacher.name}</span>
                    </div>
                  </td>
                  <td>{teacher.subject}</td>
                  <td>
                    <div className="days-badges">
                      {['M', 'T', 'W', 'Th', 'F', 'S'].map((day) => (
                        <React.Fragment key={day}>
                          {getDayBadge(day, teacher)}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                  <td>{teacher.usualTime}</td>
                  <td>
                    <span className={`status-badge ${teacher.status}`}>
                      {teacher.status === 'available' ? 'Available' : 'Not Available'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-icon view-teacher"
                      title="View Profile"
                      onClick={() => navigate(`/teachers/${teacher._id}`)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
