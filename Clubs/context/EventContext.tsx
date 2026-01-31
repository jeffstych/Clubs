import React, { createContext, useContext, useState } from 'react';

interface CalendarEvent {
    id: string;
    clubId: string;
    clubName: string;
    time: string;
    location: string;
}

interface EventContextType {
    events: CalendarEvent[];
    addEvent: (event: CalendarEvent) => void;
    removeEvent: (eventId: string) => void;
    isEventAdded: (clubId: string) => boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const addEvent = (event: CalendarEvent) => {
        setEvents(prev => [...prev, event]);
    };

    const removeEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const isEventAdded = (clubId: string) => {
        return events.some(e => e.clubId === clubId);
    };

    return (
        <EventContext.Provider value={{ events, addEvent, removeEvent, isEventAdded }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};
