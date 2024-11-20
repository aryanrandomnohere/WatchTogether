import { FormEvent, useState } from "react";
import n from "./n.png";
import axios from "axios";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

interface AuthenticationProps {
  close?: () => void;
}


export default function Authentication({ close }: AuthenticationProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] =useState<boolean>(false);
  const {login} = useAuth();
  
  const handleToggle = () => {
    setIsSignup((prev) => !prev);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
setIsLoading(true);
    const url = isSignup
      ? "http://192.168.0.106:5000/api/v1/Auth/signup"
      : "http://192.168.0.106:5000/api/v1/Auth/login";
      
    const data = isSignup
      ? { email, firstname, lastname, username, password } // Send all fields for signup
      : { email, password }; // Send only email and password for login

    try {
      console.log(data);
      
      const response = await axios.post(url, data);
      const token = response.data.token;

      // Save token to local storage
      login(token);

      toast.success(`${isSignup ? "Signup" : "Login"} successful`,{
        style: {
          borderRadius: '5px',
          background: '#333',
          color: '#fff',
        },
      });
      setIsLoading(false);
      if (close) close();
    } catch (error) {
      console.log();
      //@ts-ignore
      toast.error(`${isSignup ? "Signup" : "Login"} Failed: ${error.response.data.msg}`);
      setIsLoading(false);  
      // Handle errors accordingly, e.g., show a message to the user
    }
  };


 <span className="loading loading-dots loading-lg"></span> 



  return (
    <div className="flex items-center justify-center">


      <section className="w-full max-w-md px-1 pb-7 rounded-lg shadow-lg">
        <div className="text-center mb-0">
          <img className="mx-auto mb-12 w-32" src={n} alt="logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <p className="mb-2 text-start text-yellow-600">
            Please {isSignup ? "create an account" : "login to your account"}
          </p>

          {/* Email Input */}
          <div className="mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer block w-full px-4 py-2 rounded min-w-72 md:min-w-96  bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
              placeholder="Email"
              disabled={isLoading}
              required
            />
          </div>

          {/* First Name Input (only for signup) */}
          <div className="flex gap-3">
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                className="peer block  w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
                placeholder="First Name"
                disabled={isLoading}
                required
              />
            </div>
          )}

          {/* Last Name Input (only for signup) */}
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                className="peer block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
                placeholder="Last Name"
                disabled={isLoading}
                required
              />
            </div>
          )}</div>

          {/* Username Input (only for signup) */}
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="peer block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
                placeholder="Username"
                disabled={isLoading}
                required
              />
            </div>
          )}

          {/* Password Input */}
          <div className="relative mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer mb-8 block min-w-72 md:min-w-96  w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
              placeholder="Password"
              disabled={isLoading}
              required
            />
          </div>

          {/* Login/Signup Button */}
          <div className="text-center mb-6">
            <button
              type="submit"
              className="w-full px-6 py-3 rounded text-xs font-medium uppercase text-white transition duration-150 ease-in-out"
              style={{
                background: 'linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)',
              }}
            >
              {isSignup ? "Sign Up" : "Log In"}
            </button>
            {!isSignup && (
              <a href="#!" className="block mt-3 text-end text-sm text-yellow-600">
                Forgot password?
              </a>
            )}
          </div>

          {/* Toggle Between Login and Signup */}
          <div className="text-center">
            <p className="mb-2 text-yellow-600">
              {isSignup ? "Already have an account?" : "Don’t have an account?"}
              <span
                onClick={handleToggle}
                className="text-blue-600 underline cursor-pointer"
              >
                {isSignup ? " Login" : " Sign Up"}
              </span>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
