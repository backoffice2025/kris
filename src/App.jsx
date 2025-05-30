import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import KRISheet from "./Components/KRISheet/KRISheet";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import ViewRequirement from "./Components/AdminDashboard/ViewRequirement";
import EditItem from "./Components/AdminDashboard/EditItem"; // Import the new component
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import NotFound from "./NotFound";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === "admin@kris.com");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to={isAdmin ? "/admin" : "/kri"} /> : <LoginSignup />} />
          
          {/* Protected user route */}
          <Route
            path="/kri"
            element={
              <ProtectedRoute user={user}>
                <KRISheet />
              </ProtectedRoute>
            }
          />
          
          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute user={user} isAdmin={isAdmin}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/view-requirement/:id"
            element={
              <AdminRoute user={user} isAdmin={isAdmin}>
                <ViewRequirement />
              </AdminRoute>
            }
          />
          {/* Add the new EditItem route */}
          <Route
            path="/edit-item/:id/:index"
            element={
              <AdminRoute user={user} isAdmin={isAdmin}>
                <EditItem />
              </AdminRoute>
            }
          />
          
          {/* Default redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={isAdmin ? "/admin" : "/kri"} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;