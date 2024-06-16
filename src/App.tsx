import { useAuth0 } from "@auth0/auth0-react";
import { Dashboard, NavBar } from "./components";
import { QueryWrapper } from "./utilities";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth0();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsUserAuthenticated(false);
    } else {
      setIsUserAuthenticated(true);
    }
  }, [isAuthenticated]);

  return (
    <QueryWrapper>
      <NavBar setIsUserAuthenticated={setIsUserAuthenticated} />
      <div className="main-content">
        {isUserAuthenticated ? (
          <Dashboard />
        ) : (
          <b>Please Login to see the dashboard</b>
        )}
      </div>
    </QueryWrapper>
  );
}

export default App;
