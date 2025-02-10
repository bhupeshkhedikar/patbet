
import "../../src/AdminPanel.css"; // Import the CSS file for styling
import AnnouncementManager from "./Admin/AnnouncementManager";
import BetsHistory from "./Admin/BetsHistroy";
import ManageGames from "./Admin/ManageGames";
import ManageTimes from "./Admin/ManageTimes";
import OnlineUsers from "./Admin/OnlineUsers";
import RegisteredUsers from "./Admin/RegisteredUsers";
import Transactions from "./Admin/Transactions";

const AdminPanel = () => {
  return (
    <>
      <OnlineUsers/>
       <RegisteredUsers/>
        <BetsHistory/>
        <ManageGames />
      <Transactions />
      <AnnouncementManager />
      <ManageTimes/>
    </>
  );
};

export default AdminPanel;
