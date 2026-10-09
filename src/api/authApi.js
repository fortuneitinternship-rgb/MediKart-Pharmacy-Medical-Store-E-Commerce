import axios from "axios";


// =====================================================
// MEDIKART AUTH + USER API
// React Frontend ↔ FastAPI Backend
// =====================================================

const API_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// =====================================================
// COMMON ERROR HANDLER
// =====================================================

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    // FastAPI validation errors
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((error) => {
          if (typeof error === "string") {
            return error;
          }

          return error.msg || "Validation error";
        })
        .join(", ");
    }

    // Normal FastAPI error
    if (typeof data.detail === "string") {
      return data.detail;
    }

    // Custom backend message
    if (data.message) {
      return data.message;
    }

    return "Something went wrong";
  } catch {
    return "Unable to connect to the server";
  }
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

export const registerUser = async (userData) => {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username:
          userData.username || userData.name,

        email: userData.email,

        password: userData.password,

        confirm_password:
          userData.confirm_password ||
          userData.confirmPassword,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return await response.json();
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

export const loginUser = async (
  email,
  password
) => {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  const data = await response.json();

  // Save access token
  if (data.access_token) {
    localStorage.setItem(
      "access_token",
      data.access_token
    );
  }

  // Save user
  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "username",
      data.user.username ||
        data.user.name ||
        ""
    );
  }

  localStorage.setItem(
    "isLoggedIn",
    "true"
  );

  window.dispatchEvent(
    new Event("userUpdated")
  );

  return data;
};

// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

export const getCurrentUser = async () => {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not logged in");
  }

  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      logoutUser();
    }

    throw new Error(
      await getErrorMessage(response)
    );
  }

  const user = await response.json();

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

  if (user.username || user.name) {
    localStorage.setItem(
      "username",
      user.username || user.name
    );
  }

  return user;
};

// =====================================================
// UPDATE CURRENT USER
// PUT /api/users/me
// =====================================================

export const updateCurrentUser = async (
  userData
) => {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not logged in");
  }

  const response = await fetch(
    `${API_URL}/api/users/me`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        full_name:
          userData.full_name ||
          userData.name ||
          userData.username,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  const updatedUser =
    await response.json();

  const normalizedUser = {
    ...updatedUser,
    name: updatedUser.full_name || updatedUser.name,
  };

  try {
    localStorage.setItem(
      "user",
      JSON.stringify(normalizedUser)
    );
    if (normalizedUser.username || normalizedUser.name) {
      localStorage.setItem(
        "username",
        normalizedUser.username || normalizedUser.name
      );
    }
  } catch (storageError) {
    console.error(
      "Profile was updated but local user data could not be cached:",
      storageError
    );
  }

  window.dispatchEvent(
    new Event("userUpdated")
  );

  return normalizedUser;
};

// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = () => {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "isLoggedIn"
  );

  localStorage.removeItem(
    "username"
  );

  window.dispatchEvent(
    new Event("userUpdated")
  );
};

// =====================================================
// CHECK LOGIN STATUS
// =====================================================

export const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem(
      "access_token"
    )
  );
};

// ==========================================
// FORGOT PASSWORD - SEND OTP
// ==========================================

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/forgot-password`,
      {
        email: email.trim(),
      }
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.detail ||
      "Unable to send OTP."
    );
  }
};


// ==========================================
// VERIFY OTP
// ==========================================

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/verify-otp`,
      {
        email: email.trim(),
        otp: otp,
      }
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.detail ||
      "Invalid OTP."
    );
  }
};


// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (
  email,
  otp,
  password
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/reset-password`,
      {
        email: email.trim(),
        otp: otp,
        new_password: password,
      }
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.detail ||
      "Unable to reset password."
    );
  }
};

// =====================================================
// NEWSLETTER SUBSCRIBE
// POST /api/newsletter/subscribe
// =====================================================

export const subscribeNewsletter = async (
  email
) => {
  const response = await fetch(
    `${API_URL}/api/newsletter/subscribe`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return await response.json();
};

// =====================================================
// NEWSLETTER UNSUBSCRIBE
// POST /api/newsletter/unsubscribe
// =====================================================

export const unsubscribeNewsletter =
  async (email) => {
    const response = await fetch(
      `${API_URL}/api/newsletter/unsubscribe`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response)
      );
    }

    return await response.json();
  };

// =====================================================
// GET NEWSLETTER STATUS
// GET /api/newsletter/status
// =====================================================

export const getNewsletterStatus =
  async (email) => {
    const response = await fetch(
      `${API_URL}/api/newsletter/status?email=${encodeURIComponent(
        email
      )}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response)
      );
    }

    return await response.json();
  };

// =====================================================
// GET AUTH TOKEN
// =====================================================

export const getAccessToken = () => {
  return localStorage.getItem(
    "access_token"
  );
};

// =====================================================
// GET STORED USER
// =====================================================

export const getStoredUser = () => {
  const user =
    localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// =====================================================
// CLEAR AUTH DATA
// =====================================================

export const clearAuthData = () => {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "isLoggedIn"
  );

  localStorage.removeItem(
    "username"
  );

  window.dispatchEvent(
    new Event("userUpdated")
  );
};

// =====================================================
// EXPORT API URL
// =====================================================

export { API_URL };