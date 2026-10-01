import React, { useEffect, useState } from "react";
import {
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaEdit,
    FaSave,
} from "react-icons/fa";
import "./Profile.css";
import {
    getUserProfile,
    updateCurrentUser,
} from "../../api/authApi";

const Profile = () => {
    const [editing, setEditing] = useState(false);

    const [user, setUser] = useState({
        full_name: "",
        email: "",
        phone: "",
        profile_image: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;
        getUserProfile()
            .then((profile) => {
                if (active) setUser(profile);
            })
            .catch((requestError) => {
                if (active) setError(requestError.message || "Unable to load profile.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
        setError("");
        setSuccess("");
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const updatedUser = await updateCurrentUser({
                full_name: user.full_name,
                phone: user.phone,
                profile_image: user.profile_image,
            });
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("username", updatedUser.full_name);
            setEditing(false);
            window.dispatchEvent(new Event("userUpdated"));
            setSuccess("Profile updated successfully.");
        } catch (requestError) {
            setError(requestError.message || "Unable to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <main className="profile-page"><p role="status">Loading profile...</p></main>;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">

                <div className="profile-top">
                    {user.profile_image ? (
                        <img className="profile-avatar profile-avatar-image" src={user.profile_image} alt="Profile" />
                    ) : (
                        <FaUserCircle className="profile-avatar" />
                    )}

                    <h2>{user.full_name}</h2>
                    <p>MEDIKART Customer</p>
                </div>

                <div className="profile-body">

                    <div className="profile-row">
                        <FaUserCircle />
                        {editing ? (
                            <input
                                type="text"
                                name="full_name"
                                aria-label="Full name"
                                value={user.full_name}
                                onChange={handleChange}
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        ) : (
                            <span>{user.full_name}</span>
                        )}
                    </div>

                    <div className="profile-row">
                        <FaEnvelope />
                        <span>{user.email}</span>
                    </div>

                    <div className="profile-row">
                        <FaPhone />
                        {editing ? (
                            <input
                                type="tel"
                                name="phone"
                                aria-label="Phone number"
                                value={user.phone}
                                onChange={handleChange}
                                inputMode="tel"
                                autoComplete="tel"
                            />
                        ) : (
                            <span>{user.phone}</span>
                        )}
                    </div>

                    <div className="profile-row">
                        <FaUserCircle />
                        <label htmlFor="profile-image">Profile image URL</label>
                        {editing ? (
                            <input
                                id="profile-image"
                                type="url"
                                name="profile_image"
                                aria-label="Profile image URL"
                                value={user.profile_image || ""}
                                onChange={handleChange}
                                maxLength={2048}
                            />
                        ) : (
                            <span>{user.profile_image || "Not set"}</span>
                        )}
                    </div>

                </div>

                {error && <p className="profile-message profile-error" role="alert">{error}</p>}
                {success && <p className="profile-message profile-success" role="status">{success}</p>}

                <div className="profile-buttons">
                    {editing ? (
                        <>
                        <button className="save-btn" onClick={handleSave} disabled={saving}>
                            <FaSave />
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button className="edit-btn" onClick={() => { setEditing(false); setError(""); }} disabled={saving}>Cancel</button>
                        </>
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