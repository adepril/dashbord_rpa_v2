import { createContext, useContext, useState, ReactNode } from 'react';

interface ShowAllRobotsContextType {
  showAllRobots: boolean;
  setShowAllRobots: (value: boolean) => void;
}

const ShowAllRobotsContext = createContext<ShowAllRobotsContextType>({
  showAllRobots: true,
  setShowAllRobots: () => {}
});

export const ShowAllRobotsProvider = ({ children }: { children: ReactNode }) => {
  const [showAllRobots, setShowAllRobots] = useState(true);

  return (
    <ShowAllRobotsContext.Provider value={{ showAllRobots, setShowAllRobots }}>
      {children}
    </ShowAllRobotsContext.Provider>
  );
};

export const useShowAllRobots = () => useContext(ShowAllRobotsContext);
