import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

// Share Icon for links
const ShareIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 inline-block ml-1"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.87c-.52-.47-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.1 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
    </svg>
);

const Post = () => {
    //common fields
    const URI = "https://brocode-t04c.onrender.com";

    const navigate = useNavigate();

    const { id } = useParams();

    const [currentUser, setCurrentUser] = useState("");
    const [currentUserData, setCurrentUserData] = useState();
    const [toggleComment, setToggleComment] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            console.log(decoded.email); // 👉 email from payload
            setCurrentUser(decoded.email);
        }

        const fetchCurrentUserData = async () => {
            try {
                const newdata = await axios.get(`${URI}/api/user/user/${currentUser}`);
                if (newdata.data.success) {
                    setCurrentUserData(newdata.data.message);
                }
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchCurrentUserData();
    }, [currentUser]);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        toast.success('Logout Successfully!');
        navigate("/login");
    };
    //common fields

    // State to manage form fields
    const [postData, setPostData] = useState({
        companyName: "",
        rounds: [],
        yourAdvice: "",
        verdict: "In Progress",
        appliedOn: "On-Campus",
    });

    // Handlers for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPostData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handlers for dynamic rounds
    const addRound = () => {
        setPostData((prevState) => ({
            ...prevState,
            rounds: [
                ...prevState.rounds,
                {
                    roundName: `Round ${prevState.rounds.length + 1}`,
                    summary: "",
                    links: [""],
                },
            ],
        }));
    };

    const deleteRound = (index) => {
        const newRounds = [...postData.rounds];
        newRounds.splice(index, 1);
        setPostData((prevState) => ({
            ...prevState,
            rounds: newRounds,
        }));
    };

    const handleRoundChange = (index, e) => {
        const { name, value } = e.target;
        const newRounds = [...postData.rounds];
        newRounds[index][name] = value;
        setPostData((prevState) => ({
            ...prevState,
            rounds: newRounds,
        }));
    };

    const addLink = (roundIndex) => {
        const newRounds = [...postData.rounds];
        newRounds[roundIndex].links.push('');
        setPostData(prevState => ({
            ...prevState,
            rounds: newRounds
        }));
    };

    const deleteLink = (roundIndex, linkIndex) => {
        const newRounds = [...postData.rounds];
        newRounds[roundIndex].links.splice(linkIndex, 1);
        setPostData(prevState => ({
            ...prevState,
            rounds: newRounds
        }));
    };

    const handleLinkChange = (roundIndex, linkIndex, e) => {
        const { value } = e.target;
        const newRounds = [...postData.rounds];
        newRounds[roundIndex].links[linkIndex] = value;
        setPostData(prevState => ({
            ...prevState,
            rounds: newRounds
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalPostData = {
            ...postData,
            name: currentUserData.name,
            email: currentUser,
            likes: [],
            comments: [],
            isApproved: false,
            branch: currentUserData.branch,
        };

        try {
            const newdata = await axios.post(`${URI}/api/posts/post`, finalPostData);
            if (newdata.data.success) {
                setPostData({
                    companyName: "",
                    rounds: [],
                    yourAdvice: "",
                    verdict: "In Progress",
                    appliedOn: "On-Campus",
                });
                toast.success('Posted Successfully!');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const NavLink = ({ to, text, isButton = false, onClick }) => {
        const classes = `font-semibold transition-colors cursor-pointer text-gray-800 hover:text-green-600 ${isButton ? 'py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-bold text-white bg-green-500 hover:bg-green-600 hover:text-white' : 'text-xs sm:text-base'
            }`;

        const handleClick = (e) => {
            if (onClick) {
                onClick(e);
            } else {
                navigate(to);
            }
            setIsMenuOpen(false); // Close menu on click
        };

        return (
            <a onClick={handleClick} className={classes}>
                {text}
            </a>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-white p-4 shadow-md flex justify-between items-center fixed w-full top-0 z-10">
                <div className="flex items-center space-x-2 sm:space-x-6">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>BroCode</span>
                    {/* Desktop Links */}
                    <div className="hidden sm:flex items-center space-x-6">
                        <NavLink to="/" text="Home" />
                        <NavLink to="/interviews" text="Interviews" />
                        <NavLink to="/feedback" text="Feedback" />
                    </div>
                </div>

                {/* User Buttons */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Desktop Buttons */}
                    <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                        <NavLink to="/post" text="Post" isButton={true} />
                        <NavLink to="/profile" text="Profile" isButton={true} />
                        <NavLink text="Logout" isButton={true} onClick={handleLogout} />
                    </div>
                    {/* Mobile Menu Button */}
                    <button className="sm:hidden text-gray-800" onClick={() => setIsMenuOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer Menu */}
            <div className={`fixed inset-0 z-20 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden`}>
                <div className="bg-white w-full h-full p-6 shadow-lg flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">BroCode</span>
                        <button onClick={() => setIsMenuOpen(false)} className="text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <hr className="my-2" />
                    <NavLink to="/" text="Home" />
                    <NavLink to="/interviews" text="Interviews" />
                    <NavLink to="/feedback" text="Feedback" />
                    <NavLink to="/post" text="Post" isButton={true} />
                    <NavLink to="/profile" text="Profile" isButton={true} />
                    <NavLink text="Logout" isButton={true} onClick={handleLogout} />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center p-6 pt-10 mt-10 md:mt-20">
                <div className="w-full max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 text-center">
                        Share Your Experience
                    </h1>
                    <p className="text-gray-600 text-center mb-10">
                        Help your fellow bros by sharing your interview experience!
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-8 rounded-lg shadow-md space-y-6"
                    >
                        {/* Company and AppliedOn */}
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={postData.companyName}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Google, Microsoft"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Applied On
                                </label>
                                <select
                                    name="appliedOn"
                                    value={postData.appliedOn}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="On-Campus">On-Campus</option>
                                    <option value="Off-Campus">Off-Campus</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Verdict
                                </label>
                                <select
                                    name="verdict"
                                    value={postData.verdict}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Selected">Selected</option>
                                    <option value="Not Selected">Not Selected</option>
                                </select>
                            </div>
                        </div>

                        <hr className="my-6" />

                        {/* Dynamic Rounds */}
                        <h2 className="text-2xl font-bold text-gray-900">Interview Rounds</h2>
                        {postData.rounds.map((round, roundIndex) => (
                            <div key={roundIndex} className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">{`Round ${roundIndex + 1}`}</h3>
                                    <button
                                        type="button"
                                        onClick={() => deleteRound(roundIndex)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Delete Round
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Round Name</label>
                                        <input
                                            type="text"
                                            name="roundName"
                                            value={round.roundName}
                                            onChange={(e) => handleRoundChange(roundIndex, e)}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="e.g., Technical Round 1, HR Round"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Summary of this Round</label>
                                        <textarea
                                            name="summary"
                                            value={round.summary}
                                            onChange={(e) => handleRoundChange(roundIndex, e)}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            rows="4"
                                            placeholder="Describe your experience in this round."
                                            required
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Helpful Links</label>
                                        <div className="space-y-2">
                                            {round.links.map((link, linkIndex) => (
                                                <div key={linkIndex} className="flex items-center space-x-2">
                                                    <input
                                                        type="url"
                                                        value={link}
                                                        onChange={(e) => handleLinkChange(roundIndex, linkIndex, e)}
                                                        className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        placeholder="Paste a link (e.g., a LeetCode problem)"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteLink(roundIndex, linkIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addLink(roundIndex)}
                                                className="py-2 px-4 text-sm font-semibold rounded-md text-green-600 hover:text-green-800 transition-colors"
                                            >
                                                + Add Another Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addRound}
                            className="w-full py-3 px-4 rounded-md font-bold text-white bg-green-500 hover:bg-green-600 transition-colors mt-4"
                        >
                            Add Another Round
                        </button>

                        <hr className="my-6" />

                        {/* Your Advice Section */}
                        <h2 className="text-2xl font-bold text-gray-900">Your Advice</h2>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">
                                Final Advice for Your Bros
                            </label>
                            <textarea
                                name="yourAdvice"
                                value={postData.yourAdvice}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="6"
                                placeholder="Share your key takeaways, tips, and what you wish you knew earlier."
                            ></textarea>
                        </div>

                        {/* Admin Review Note */}
                        <div className="bg-blue-100 p-4 rounded-lg text-blue-800 text-sm">
                            <p className="font-semibold">Note:</p>
                            <p>
                                Admin panel will review your data before it appears to all
                                users.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center mt-8">
                            <button
                                type="submit"
                                className="w-full py-3 px-8 rounded-full text-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
                            >
                                Submit Experience
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Tailbar / Footer */}
            <footer className="bg-white py-12 text-center text-gray-600 text-sm shadow-inner mt-auto">
                <p className="mb-2 text-base">
                    BroCode. All Rights Reserved. | Connecting students and alumni for a
                    brighter future.
                </p>
                <p className="text-sm">
                    This platform is a community-driven space for sharing knowledge and
                    experiences. We are not affiliated with any specific company or
                    university.
                </p>
            </footer>
        </div>
    );
};

export default Post;
