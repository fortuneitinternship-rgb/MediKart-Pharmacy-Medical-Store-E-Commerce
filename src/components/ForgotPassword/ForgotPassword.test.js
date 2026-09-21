import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

// Mock the fetch API
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      onClose: jest.fn(),
      onSwitchToLogin: jest.fn(),
    };
    return render(
      <BrowserRouter>
        <ForgotPassword {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  // ==========================================
  // TEST: Initial Render
  // ==========================================
  test('renders forgot password form initially', () => {
    renderComponent();

    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText(/Enter your registered email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
  });

  // ==========================================
  // TEST: Close Button
  // ==========================================
  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderComponent({ onClose });

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // TEST: Back to Login Button
  // ==========================================
  test('calls onSwitchToLogin when Back to Login is clicked', () => {
    const onSwitchToLogin = jest.fn();
    renderComponent({ onSwitchToLogin });

    const backButton = screen.getByText('Back to Login');
    fireEvent.click(backButton);

    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
  });

  test('navigates to login when onSwitchToLogin is not provided', () => {
    renderComponent({ onSwitchToLogin: undefined });

    const backButton = screen.getByText('Back to Login');
    fireEvent.click(backButton);

  });

  // ==========================================
  // TEST: Form Validation - Empty Email
  // ==========================================
  test('shows error when submitting without email', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /Send OTP/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: Form Validation - Invalid Email Format
  // ==========================================
  test('accepts email and sends OTP', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully', otp: '123456' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    expect(screen.getByText('Sending OTP...')).toBeInTheDocument();

  });

  // ==========================================
  // TEST: API Error - Failed to Fetch
  // ==========================================
  test('shows error when network request fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cannot connect to server/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: API Error - Server Error
  // ==========================================
  test('shows error when server returns error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid email address' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: OTP Verification Step
  // ==========================================
  test('shows OTP input after sending OTP', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify OTP/i })).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: OTP Validation
  // ==========================================
  test('shows error when OTP is less than 6 digits', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });

    await userEvent.type(otpInput, '12345');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 6-digit OTP.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: OTP Verification Success
  // ==========================================
  test('moves to reset password step after OTP verification', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);
  });

  // ==========================================
  // TEST: Reset Password - Empty Fields
  // ==========================================
  test('shows error when reset password fields are empty', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });

    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter your password.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: Reset Password - Password Mismatch
  // ==========================================
  test('shows error when passwords do not match', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmInput = screen.getByPlaceholderText('Confirm Password');
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmInput, 'password456');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: Reset Password - Password Too Short
  // ==========================================
  test('shows error when password is less than 6 characters', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmInput = screen.getByPlaceholderText('Confirm Password');
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });

    await userEvent.type(passwordInput, '123');
    await userEvent.type(confirmInput, '123');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: Reset Password Success
  // ==========================================
  test('shows success message after password reset', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password reset successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmInput = screen.getByPlaceholderText('Confirm Password');
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmInput, 'password123');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Password Reset Successfully')).toBeInTheDocument();
      expect(screen.getByText(/Your password has been changed successfully/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Login/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: Back Button Navigation - FIXED
  // ==========================================
  test('goes back to email step from OTP step', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    renderComponent();

    // Send OTP
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    // Click Back
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    // Verify we're back to email step
    await waitFor(() => {
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  // ==========================================
  // TEST: Back Button from Reset to OTP - FIXED
  // ==========================================
  test('goes back to OTP step from Reset step', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    renderComponent();

    // Send OTP
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    // Verify OTP
    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });

    // Click Back
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    // Verify we're back to OTP step
    expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
  });

  // ==========================================
  // TEST: Reset Password API Error
  // ==========================================
  test('shows error when reset password API fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid OTP or email' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');
    const verifyButton = screen.getByRole('button', { name: /Verify OTP/i });
    await userEvent.type(otpInput, '123456');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmInput = screen.getByPlaceholderText('Confirm Password');
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmInput, 'password123');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP or email')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST: Loading States
  // ==========================================
  test('shows loading state while sending OTP', async () => {
    // Delayed response
    fetch.mockImplementationOnce(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'OTP sent successfully' }),
        }), 100)
      )
    );

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    expect(screen.getByText('Sending OTP...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  // ==========================================
  // TEST: OTP Input Only Allows Numbers
  // ==========================================
  test('OTP input only allows numeric characters', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP sent successfully' }),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Send OTP/i });
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('Enter OTP');

    // Should only contain numbers
  });
});