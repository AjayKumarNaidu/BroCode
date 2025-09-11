import { Route, Routes } from 'react-router-dom';
import './App.css'
import { ToastContainer } from "react-toastify";
import Home from './pages/Home';
import Register from './pages/Register';
import Private from './pages/Private';
import Login from './pages/Login';
import Interviews from './pages/Interviews';
import Interview from './pages/Interview';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Post from './pages/Post';
import UpdatePost from './pages/UpdatePost';
import AdminLogin from './pages/AdminLogin';
import AllowAccess from './pages/AllowAccess';
import AllowFeedback from './pages/AllowFeedback';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={
          <Private>
            <Home />
          </Private>
        } />
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/adminLogin' element={<AdminLogin />} />
        <Route path='/interviews' element={<Private><Interviews/></Private>} />
        <Route path='/interview/:id' element={<Private><Interview/></Private>} />
        <Route path='/feedback' element={<Private><Feedback/></Private>} />
        <Route path='/profile' element={<Private><Profile/></Private>} />
        <Route path='/post' element={<Private><Post/></Private>} />
        <Route path='/updatePost/:id' element={<Private><UpdatePost/></Private> } />
        <Route path='allowAccess' element={<Private><AllowAccess/></Private>} />
        <Route path='allowFeedback' element={<Private><AllowFeedback/></Private>} />
      </Routes>
      <ToastContainer 
          position="top-right"    // where the toast appears
          autoClose={3000}        // auto close in 3s
          hideProgressBar={false} // show/hide progress bar
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"         // colored, light, dark
      />
    </>
  );
}

export default App;
