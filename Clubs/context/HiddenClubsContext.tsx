import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface HiddenClubsContextType {
    hiddenClubIds: string[];
    hideClub: (clubId: string) => void;
    unhideClub: (clubId: string) => void;
    clearHiddenClubs: () => void;
    isHidden: (clubId: string) => boolean;
}

const HiddenClubsContext = createContext<HiddenClubsContextType | undefined>(undefined);

export const HiddenClubsProvider = ({ children }: { children: ReactNode }) => {
    const [hiddenClubIds, setHiddenClubIds] = useState<string[]>([]);

    const hideClub = useCallback((clubId: string) => {
        setHiddenClubIds((prev) => {
            if (prev.includes(clubId)) return prev;
            return [...prev, clubId];
        });
    }, []);

    const unhideClub = useCallback((clubId: string) => {
        setHiddenClubIds((prev) => prev.filter((id) => id !== clubId));
    }, []);

    const clearHiddenClubs = useCallback(() => {
        setHiddenClubIds([]);
    }, []);

    const isHidden = useCallback((clubId: string) => {
        return hiddenClubIds.includes(clubId);
    }, [hiddenClubIds]);

    return (
        <HiddenClubsContext.Provider value={{ hiddenClubIds, hideClub, unhideClub, clearHiddenClubs, isHidden }}>
            {children}
        </HiddenClubsContext.Provider>
    );
};

export const useHiddenClubs = () => {
    const context = useContext(HiddenClubsContext);
    if (context === undefined) {
        throw new Error('useHiddenClubs must be used within a HiddenClubsProvider');
    }
    return context;
};
