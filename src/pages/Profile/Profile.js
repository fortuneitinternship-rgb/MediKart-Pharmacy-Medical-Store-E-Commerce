import React, { useEffect, useState } from "react";
import {
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaEdit,
    FaSave,
} from "react-icons/fa";
import "./Profile.css";
import {
    getCurrentUser,
    updateCurrentUser,
} from "../../api/loginApi";

const Profile = () => {
    const [editing, setEditing] = useState(false);

    const [user, setUser] = useState({
        name: "Satender Kashyap",
        email: "satender@example.com",
        phone: "",
        address: "Delhi, India",
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await getCurrentUser();

                setUser((previousUser) => ({
                    ...previousUser,
                    ...currentUser,
                    name:
                        currentUser.full_name ||
                        currentUser.name ||
                        previousUser.name,
                    address: currentUser.address || previousUser.address,
                }));
            } catch (error) {
                console.error("Unable to load profile:", error);
            }
        };

        loadUser();
    }, []);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        try {
            const updatedUser = await updateCurrentUser(user);
            const updatedName =
                updatedUser.full_name || updatedUser.name;
            const savedUser = { ...updatedUser, name: updatedName };

            setUser((previousUser) => ({
                ...previousUser,
                ...savedUser,
            }));
            try {
                localStorage.setItem("user", JSON.stringify(savedUser));
                localStorage.setItem("username", updatedName);
            } catch (storageError) {
                console.error(
                    "Profile was saved but local user data could not be cached:",
                    storageError
                );
            }
            setEditing(false);
            window.dispatchEvent(new Event("userUpdated"));
            alert("Profile Updated Successfully!");
        } catch (error) {
            alert(error.message || "Unable to update profile.");
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-card">

                <div className="profile-top">
                    <FaUserCircle className="profile-avatar" />

                    <h2>{user.name}</h2>
                    <p>MEDIKART Customer</p>
                </div>

                <div className="profile-body">

                    <div className="profile-row">
                        <FaUserCircle />
                        {editing ? (
                            <input
                                type="text"
                                name="name"
                                value={user.name}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.name}</span>
                        )}
                    </div>

                    <div className="profile-row">
                        <FaEnvelope />
                        {editing ? (
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.email}</span>
                        )}
                    </div>

                    <div className="profile-row">
                        <FaPhone />
                        {editing ? (
                            <input
                                type="text"
                                name="phone"
                                value={user.phone}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.phone}</span>
                        )}
                    </div>

                    <div className="profile-row">
                        <FaMapMarkerAlt />
                        {editing ? (
                            <input
                                type="text"
                                name="address"
                                value={user.address}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.address}</span>
                        )}
                    </div>

                </div>

                <div className="profile-buttons">
                    {editing ? (
                        <button className="save-btn" onClick={handleSave}>
                            <FaSave />
                            Save
                        </button>
                    ) : (
                        <button
                            className="edit-btn"
                            onClick={() => setEditing(true)}
                        >
                            <FaEdit />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Profile;