import React, { useState } from "react";
import { auth } from "../../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import "./LoginSignup.css"; // Import the CSS file

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setEmail("");
    setPassword("");
  };

  if (user) {
    return (
      <div className="welcome-container">
        <h2>Welcome, {user.email}</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <button type="submit" className="auth-submit-btn">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p className="auth-toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="toggle-btn"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default LoginSignup;