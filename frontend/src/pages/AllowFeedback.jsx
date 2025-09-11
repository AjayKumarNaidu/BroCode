import { useEffect, useState } from "react";
import axios from 'axios'

function AllowFeedback() {

  //imp
  const URI = "http://localhost:5000";

  const [authorized,setAuthorized] = useState(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${URI}/api/user/allowFeedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res)
        if(res.data.success){
          setAuthorized(true)
        }else{
          setAuthorized(false)
        }
        console.log("Admin data:", res.data);
      } catch (err) {
        setAuthorized(false);
        console.log("Error:",err.message);
      }
    };

    fetchAdminDashboard();
  }, []);
  //imp

  const [feedbackData,setFeedbackData] = useState([]);

  useEffect(()=>{
    const fetchFeedbackData = async()=>{
      try {
        const newdata = await axios.get(`${URI}/api/feedback/all`);
        if(newdata.data.success){
          setFeedbackData(newdata.data.message);
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchFeedbackData();
  },[])

  if(authorized == null) return <h1>Loading</h1>;

  if(authorized == false) return <h1>Unauthorized access</h1>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white p-4 shadow-md flex justify-between items-center fixed w-full top-0 z-10">
        <div className="flex items-center space-x-6">
          <span className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => window.location.href = '/'}>BroCode</span>
        </div>
        <div className="flex space-x-4">
          <a onClick={() => window.location.href = '/'} className="py-2 px-4 rounded-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors cursor-pointer">
            Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-6 pt-10 mt-10 md:mt-20">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">User Feedback</h1>
          <div className="space-y-6">
            {feedbackData.map((feedback, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-xl font-semibold text-gray-800 mb-2">{feedback.name}</p>
                <p className="text-sm text-gray-500 mb-4">{feedback.email}</p>
                <p className="text-gray-700 leading-relaxed">{feedback.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Tailbar / Footer */}
      <footer className="bg-white py-12 text-center text-gray-600 text-sm shadow-inner mt-auto">
        <p className="mb-2 text-base">BroCode. All Rights Reserved. | Connecting students and alumni for a brighter future.</p>
        <p className="text-sm">This platform is a community-driven space for sharing knowledge and experiences. We are not affiliated with any specific company or university.</p>
      </footer>
    </div>
  );
}
export default AllowFeedback;
