import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Appbar } from "../components/Appbar"; // Assuming you have an Appbar component
import { useToast } from "../hooks/use-toast"; // Corrected import path

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const ProfilePage = () => {
  const { toast } = useToast(); // Initialize toast
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State for edit mode
  const [editedName, setEditedName] = useState(""); // State for edited name
  const [updateError, setUpdateError] = useState<string | null>(null); // State for update errors

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setUpdateError(null); // Reset errors on fetch
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        // Optionally redirect to login page
        // navigate('/signin');
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          headers: {
            Authorization: `${token}`, // Ensure token is sent correctly
          },
        });
        setProfile(response.data);
        setEditedName(response.data.name); // Initialize editedName with fetched name
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try logging in again.");
        // Optionally clear token and redirect if auth fails
        // localStorage.removeItem('token');
        // navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Empty dependency array means this runs once on mount

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError(null); // Clear previous update errors
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditedName(profile.name); // Reset edited name to original
    }
    setUpdateError(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) {
      setUpdateError("Authentication error or profile not loaded.");
      return;
    }
    if (!editedName.trim()) {
      setUpdateError("Name cannot be empty.");
      return;
    }

    setUpdateError(null); // Clear previous errors

    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/user/me`,
        { name: editedName.trim() }, // Send updated name
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      );
      setProfile(response.data); // Update profile state with response from backend
      setIsEditing(false); // Exit edit mode
      toast({
        // Call toast on success
        title: "Profile Updated",
        description: "Your username has been updated successfully.",
      });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateError("Failed to update profile. Please try again.");
      toast({
        // Optional: Show error toast
        title: "Update Failed",
        description: "Could not update username. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Appbar />
        <div>Loading profile...</div>
      </div>
    ); // Add Appbar here if needed
  }

  if (error) {
    return (
      <div>
        <Appbar />
        <div>Error: {error}</div>
      </div>
    ); // Add Appbar here
  }

  if (!profile) {
    return (
      <div>
        <Appbar />
        <div>No profile data found.</div>
      </div>
    ); // Add Appbar here
  }

  return (
    <div>
      <Appbar />
      <div className="container mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        {updateError && (
          <div className="text-red-500 mb-4">Error: {updateError}</div>
        )}{" "}
        {/* Display update errors */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                />
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <p className="text-gray-700 text-lg mr-4">{profile.name}</p>
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <p className="text-gray-700 text-lg">{profile.email}</p>
          </div>
          {/* Add more profile details here as needed */}
        </div>
      </div>
    </div>
  );
};
