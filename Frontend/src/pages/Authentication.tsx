import { FormEvent, useState } from "react";
import n from "./n.png";
import axios from "axios";

export default function Authentication() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleToggle = () => {
    setIsSignup((prev) => !prev);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const url = isSignup
      ? "http://localhost:3000/api/v1/Auth/signup"
      : "http://localhost:3000/api/v1/Auth/login";
      
    const data = isSignup
      ? { email, firstName, lastName, username, password } // Send all fields for signup
      : { email, password }; // Send only email and password for login

    try {
      console.log(data);
      
      const response = await axios.post(url, data);
      const token = response.data.token;

      // Save token to local storage
      localStorage.setItem("token", token);

      // Optionally, you can redirect the user or update the UI
      console.log(`${isSignup ? "Signup" : "Login"} successful, token saved.`);
    } catch (error) {
      console.error("Error during authentication:", error);
      // Handle errors accordingly, e.g., show a message to the user
    }
  };

  return (
    <div className="flex items-center justify-center">
      <section className="w-full max-w-md p-2 rounded-lg shadow-lg">
        <div className="text-center mb-0">
          <img className="mx-auto mb-3 w-32" src={n} alt="logo" />
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
              className="peer block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
              placeholder="Email"
              required
            />
          </div>

          {/* First Name Input (only for signup) */}
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="peer block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
                placeholder="First Name"
                required
              />
            </div>
          )}

          {/* Last Name Input (only for signup) */}
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="peer block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
                placeholder="Last Name"
                required
              />
            </div>
          )}

          {/* Username Input (only for signup) */}
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="peer block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
                placeholder="Username"
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
              className="peer mb-8 block w-full px-4 py-2 rounded bg-transparent outline-none border border-neutral-300 transition-all duration-200 ease-linear focus:border-yellow-500 text-white"
              placeholder="Password"
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
