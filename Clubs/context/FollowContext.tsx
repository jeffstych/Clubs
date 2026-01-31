import React, { createContext, useContext, useState } from 'react';

interface FollowContextType {
    followedClubs: Set<string>;
    followClub: (clubId: string) => void;
    unfollowClub: (clubId: string) => void;
    isFollowing: (clubId: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: React.ReactNode }) => {
    const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());

    const followClub = (clubId: string) => {
        setFollowedClubs(prev => new Set(prev).add(clubId));
    };

    const unfollowClub = (clubId: string) => {
        setFollowedClubs(prev => {
            const newSet = new Set(prev);
            newSet.delete(clubId);
            return newSet;
        });
    };

    const isFollowing = (clubId: string) => {
        return followedClubs.has(clubId);
    };

    return (
        <FollowContext.Provider value={{ followedClubs, followClub, unfollowClub, isFollowing }}>
            {children}
        </FollowContext.Provider>
    );
};

export const useFollow = () => {
    const context = useContext(FollowContext);
    if (!context) {
        throw new Error('useFollow must be used within a FollowProvider');
    }
    return context;
};
