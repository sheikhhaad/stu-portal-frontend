'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

export function StudentProvider({ children }) {
    // Initial dummy data
    const [queries, setQueries] = useState([
        {
            id: 1,
            subject: 'Assignment Extension Request',
            description: 'I need more time for the final project due to illness.',
            status: 'Pending',
            date: '2023-10-25',
            teacher: 'Dr. Smith',
            response: null
        },
        {
            id: 2,
            subject: 'Lab Equipment Issue',
            description: 'monitor is not working in lab 302.',
            status: 'In Progress',
            date: '2023-10-24',
            teacher: 'Prof. Johnson',
            response: 'We are checking with IT.'
        },
        {
            id: 3,
            subject: 'Grade Query - Midterm',
            description: 'I believe my question 4 was marked incorrectly.',
            status: 'Resolved',
            date: '2023-10-20',
            teacher: 'Dr. Williams',
            response: 'Corrected. Grade updated.'
        },
    ]);

    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Your query #2 status changed to In Progress', read: false },
        { id: 2, message: 'New announcement: Midterm results are out', read: true },
    ]);

    const addQuery = (newQuery) => {
        const queryWithId = {
            ...newQuery,
            id: queries.length + 1,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            response: null
        };
        setQueries([queryWithId, ...queries]);
        return queryWithId.id;
    };

    const getStats = () => {
        return {
            pending: queries.filter(q => q.status === 'Pending').length,
            inProgress: queries.filter(q => q.status === 'In Progress').length,
            resolved: queries.filter(q => q.status === 'Resolved').length,
            unreadMessages: notifications.filter(n => !n.read).length
        };
    };

    const markNotificationRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <StudentContext.Provider value={{ queries, addQuery, getStats, notifications, markNotificationRead }}>
            {children}
        </StudentContext.Provider>
    );
}

export function useStudent() {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudent must be used within a StudentProvider');
    }
    return context;
}
