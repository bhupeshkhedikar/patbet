
import "../../src/AdminPanel.css"; // Import the CSS file for styling
import ManageGames from "./Admin/ManageGames";
import Transactions from "./Admin/Transactions";

const AdminPanel = () => {
  return (
    <>
        <ManageGames />
        <Transactions/>
    </>
  );
};

export default AdminPanel;
