// =====================================================
// MEDIKART AUTH API
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
  } catch (error) {
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
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        password: userData.password,
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

export const loginUser = async (email, password) => {
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

  // ===================================================
  // SAVE ACCESS TOKEN
  // ===================================================

  if (data.access_token) {
    localStorage.setItem(
      "access_token",
      data.access_token
    );
  }

  // ===================================================
  // SAVE USER DATA
  // ===================================================

  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "username",
      data.user.name || ""
    );
  }

  localStorage.setItem(
    "isLoggedIn",
    "true"
  );

  // Notify Navbar / other components
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
    // Token expired / invalid
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

  // Keep local user information updated
  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

  if (user.name) {
    localStorage.setItem(
      "username",
      user.name
    );
  }

  return user;
};

// =====================================================
// UPDATE CURRENT USER
// PUT /api/users/me
// =====================================================

export const updateCurrentUser = async (userData) => {
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
        name: userData.name,
        phone: userData.phone || null,
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

  // Update localStorage
  localStorage.setItem(
    "user",
    JSON.stringify(updatedUser)
  );

  if (updatedUser.name) {
    localStorage.setItem(
      "username",
      updatedUser.name
    );
  }

  // Notify Navbar/Profile/etc.
  window.dispatchEvent(
    new Event("userUpdated")
  );

  return updatedUser;
};

// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = () => {
  // Remove authentication
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

  // Notify application
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

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================================

export const forgotPassword = async (email) => {
  const response = await fetch(
    `${API_URL}/api/auth/forgot-password`,
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
// VERIFY OTP
// POST /api/auth/verify-otp
// =====================================================

export const verifyOTP = async (
  email,
  otp
) => {
  const response = await fetch(
    `${API_URL}/api/auth/verify-otp`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        otp,
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
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  const response = await fetch(
    `${API_URL}/api/auth/reset-password`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        otp,
        new_password: newPassword,
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
// EXPORT API URL
// =====================================================

export { API_URL };
