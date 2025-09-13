import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
const RegisterPage = () => {

  const URI = "https://brocode-t04c.onrender.com";

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passoutYear: '',
    branch: '',
  });

  const [loading,SetLoading] = useState(false);

  const [confirmPassword,setConfirmPassword] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async(e) => {
    e.preventDefault();
    if(formData.password !== confirmPassword){
      toast.error('Both passwords are not matching')
      setFormData({...formData,password:''})
      setConfirmPassword('');
      return;
    }
    // In a real application, you would send this data to an API
    try {
      SetLoading(true);
      const newdata = await axios.post(`${URI}/api/user/register`,formData);
      console.log(newdata.data)
      
      if(!newdata.data.success){
        window.alert(newdata.data.message);
      }else{
        toast.success('Registered Successful');
        navigate('/login');
      }
    } catch (error) {
      console.log(error)
    }finally{
      SetLoading(false)
    }
  };

  const passoutYears = Array.from({ length: 8 }, (_, i) => 2022 + i);
  const branches = [
    "cse", "csd", "csm", "it", "iot", "csbs", "ece",
    "eee", "civil", "mech", "chem", "mba"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Create Account
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="passoutYear" className="block text-sm font-medium text-gray-700">Passout Year</label>
            <select
              id="passoutYear"
              name="passoutYear"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.passoutYear}
              onChange={handleInputChange}
            >
              <option value="" disabled>Select a year</option>
              {passoutYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
            <select
              id="branch"
              name="branch"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.branch}
              onChange={handleInputChange}
            >
              <option value="" disabled>Select a branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch.toLowerCase()}>{branch.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-lg font-bold text-white transition-colors duration-200 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"}
            `}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?
          <a className="font-semibold text-green-600 hover:text-green-700 transition-colors ml-1 cursor-pointer" onClick={()=> navigate('/login')}>
            Login here.
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
