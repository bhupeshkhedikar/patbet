import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  orderBy,
  getFirestore,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import axios from "axios";
import "../Admin/AdminPanel.css";

const Transactions = () => {
    const [errorMessage, setErrorMessage] = useState("");
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [reason,setReason]=useState('')
    const [isManualUpdate, setIsManualUpdate] = useState(false); // Flag for manual updates
    const [deposits, setDeposits] = useState([]);
    const [addMoneyRequests, setAddMoneyRequests] = useState([]);


    

    useEffect(() => {
      const fetchAddMoneyRequests = async () => {
        try {
          const depositsRef = collection(db, "addMoneyRequests");
          
          // Sorting by 'createdAt' in descending order to show newest on top
          const depositsQuery = query(depositsRef, orderBy("createdAt", "desc"));
          const depositSnapshot = await getDocs(depositsQuery);
  
          const allDeposits = depositSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setAddMoneyRequests(allDeposits);
        } catch (error) {
          console.error("Error fetching add money requests:", error);
        }
      };
  
      fetchAddMoneyRequests();
    }, []);
    
    
    
      
    
      useEffect(() => {
        const fetchWithdrawalRequests = async () => {
          try {
            // Query withdrawalRequests ordered by requestDate descending
            const withdrawalsRef = collection(db, "withdrawalRequests");
            const withdrawalsQuery = query(withdrawalsRef, orderBy("requestDate", "desc"));
            const withdrawalSnapshot = await getDocs(withdrawalsQuery);
    
            const withdrawalList = withdrawalSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
    
            setWithdrawalRequests(withdrawalList);
          } catch (error) {
            setErrorMessage("Error fetching withdrawal requests");
            console.error("Error fetching withdrawal requests:", error);
          }
        };
    
        fetchWithdrawalRequests();
      }, []);
    
      useEffect(() => {
        const fetchDeposits = async () => {
          try {
            const depositsRef = collection(db, "deposits");
            const depositsQuery = query(depositsRef, orderBy("timestamp", "desc"));
            const depositSnapshot = await getDocs(depositsQuery);
    
            const depositList = depositSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp.toDate().toLocaleString(), // Convert timestamp to readable format
            }));
    
            setDeposits(depositList);
          } catch (error) {
            console.error("Error fetching deposits:", error);
          }
        };
    
        fetchDeposits();
      }, []);
    
      const handleApproveDeposit = async (depositId, userId, amount) => {
        try {
          // 1. Update the deposit request status to 'approved'
          const depositRef = doc(db, "addMoneyRequests", depositId);
          await updateDoc(depositRef, { status: "approved" });
    
          // 2. Get the current wallet balance of the user
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
    
          if (!userSnap.exists()) {
            alert("User not found!");
            return;
          }
    
          const currentBalance = userSnap.data().walletBalance || 0;
    
          // 3. Update the user's wallet balance
          await updateDoc(userRef, {
            walletBalance: currentBalance + amount,
          });
    
          // 4. Update the deposits state to remove the approved deposit
          setDeposits(prevDeposits =>
            prevDeposits.filter(deposit => deposit.id !== depositId)
          );
    
          alert("Deposit approved and wallet updated!");
        } catch (error) {
          console.error("Error approving deposit:", error);
          alert("Error approving deposit.");
        }
      };
    
      const handleRejectDeposit = async depositId => {
        try {
          const depositRef = doc(db, "addMoneyRequests", depositId);
          await updateDoc(depositRef, { status: "rejected" });
    
          setDeposits(prevDeposits =>
            prevDeposits.filter(deposit => deposit.id !== depositId)
          );
          alert("Deposit request rejected.");
        } catch (error) {
          console.error("Error rejecting deposit:", error);
          alert("Error rejecting deposit.");
        }
      };
    
    
    
      const handleApprove = async id => {
        try {
          const requestRef = doc(db, "withdrawalRequests", id);
    
          // सिर्फ़ withdrawal request का status अपडेट कर रहा है
          await updateDoc(requestRef, {
            status: "approved",
          });
    
          // UI में भी status अपडेट कर रहा है
          setWithdrawalRequests(prevRequests =>
            prevRequests.map(request =>
              request.id === id ? { ...request, status: "approved" } : request
            )
          );
    
          console.log("Withdrawal approved successfully.");
        } catch (error) {
          console.error("Error approving withdrawal:", error);
          setErrorMessage("Error approving withdrawal.");
        }
      };
    
      const handleReject = async (id, userId, amount,reason) => {
        try {
          const requestRef = doc(db, "withdrawalRequests", id);
    
          // 1. Withdrawal request का status 'rejected' में अपडेट करो
          await updateDoc(requestRef, {
            status: "rejected",
            reason
          });
    
          // 2. User का current wallet balance fetch करो
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
    
          if (!userSnap.exists()) {
            console.error("User not found!");
            setErrorMessage("User not found!");
            return;
          }
    
          const currentBalance = userSnap.data().walletBalance || 0;
    
          // 3. Rejected amount वापस wallet में जोड़ो
          await updateDoc(userRef, {
            walletBalance: currentBalance + Number(amount),
          });
    
          // 4. UI को अपडेट करो ताकि तुरंत बदलाव दिखे
          setWithdrawalRequests(prevRequests =>
            prevRequests.map(request =>
              request.id === id ? { ...request, status: "rejected" } : request
            )
          );
    
          console.log("Withdrawal rejected and balance reverted successfully.");
        } catch (error) {
          console.error("Error rejecting withdrawal:", error);
          setErrorMessage("Error rejecting withdrawal.");
        }
      };
    
    return(
      <>
            <div className="deposit-requests"  style={{marginBottom:'100px'}}>
      <h3>Deposit Requests</h3>
      <table className="requests-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>URN</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Request Date</th> {/* Added Request Date Column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {addMoneyRequests.length > 0 ? (
            addMoneyRequests.map(deposit => (
              <tr key={deposit.id}>
                <td>{deposit.userId}</td>
                <td>{deposit.urn}</td>
                <td>₹{deposit.amount}</td>
                <td>{deposit.status}</td>
                <td>
                  {deposit.createdAt
                    ? new Date(deposit.createdAt.toDate()).toLocaleString()
                    : "N/A"}
                </td> {/* Display formatted date */}
                <td>
                  <button
                    className="approve-btn"
                    onClick={() =>
                      handleApproveDeposit(deposit.id, deposit.userId, deposit.amount)
                    }
                    disabled={deposit.status === "approved"}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleRejectDeposit(deposit.id)}
                    disabled={deposit.status === "rejected"}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No pending deposit requests.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
         <div className="withdrawal-requests">
      <h3>Withdrawal Requests</h3>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <table className="requests-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Payment Method</th>
                <th>UPI ID</th>
                <td>bankAccount</td>
                <td>ifscCode </td>
                <th>Request Date</th>
                <th>Reason</th>
                <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {withdrawalRequests.map(request => (
            <tr key={request.id}>
              <td>{request.name || "N/A"}</td>
              <td>{request.userId}</td>
              <td>₹{request.amount}</td>
              <td>{request.paymentMethod || "N/A"}</td>
              <td>{request.upiId || "N/A"}</td>
              <td>{request.bankAccount || "N/A"}</td>
              <td>{request.ifscCode || "N/A"}</td>
              <td>
                {request.requestDate
                  ? new Date(request.requestDate.toDate()).toLocaleString()
                  : "N/A"}
              </td>
              <td><input 
  type="text" 
  value={request.reason} 
  onChange={(e) => setReason(e.target.value)} 
/>
</td>
              <td>{request.status}</td>
              <td>
                <button
                  className="approve-btn"
                  onClick={() =>
                    handleApprove(request.id, request.userId, request.amount)
                  }
                  disabled={request.status === "approved"}
                >
                  Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() =>
                    handleReject(request.id, request.userId, request.amount,reason)
                  }
                  disabled={request.status === "rejected"}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
        {/* <h2>Deposit History</h2>
        <table border="1" className="requests-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map(deposit => (
              <tr key={deposit.id}>
                <td>{deposit.userEmail}</td>
                <td>₹{deposit.amount}</td>
                <td>{deposit.timestamp}</td>
              </tr>
            ))}
          </tbody>
            </table> */}
 
        </>
        
    )
}
export default Transactions