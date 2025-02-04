
import "../../src/AdminPanel.css"; // Import the CSS file for styling
import BetsHistory from "./Admin/BetsHistroy";
import ManageGames from "./Admin/ManageGames";
import Transactions from "./Admin/Transactions";

const AdminPanel = () => {
  return (
    <>
      
      <BetsHistory/>
        <ManageGames />
        <Transactions/>
    </>
  );
};

export default AdminPanel;
