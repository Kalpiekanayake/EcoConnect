import { useEffect, useState } from "react";
import API from "../services/api"; 
function Dashboard() {
  const [message, setMessage] = useState("");       
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/protected");
        setMessage(response.data.message);
      } catch (error) {
        setMessage("Failed to fetch protected data.");
        console.error(error);
      }
    };     
    fetchData();
  }, []); 

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>{message}</p>
    </div>
  );        


}

export default Dashboard;   