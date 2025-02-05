
import "../../src/AdminPanel.css"; // Import the CSS file for styling
import BetsHistory from "./Admin/BetsHistroy";
import ManageGames from "./Admin/ManageGames";
import RegisteredUsers from "./Admin/RegisteredUsers";
import Transactions from "./Admin/Transactions";

const AdminPanel = () => {
  return (
    <>
       <RegisteredUsers/>
        <BetsHistory/>
        <ManageGames />
        <Transactions/>
    </>
  );
};

export default AdminPanel;
