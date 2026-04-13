import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import { normalizeArray } from '../services/arrayUtils.js';
import { generateCode, isValidEmail } from '../utils/email.js';
import { sendResetEmail, sendVerificationEmail } from '../utils/mailer.js';
import {
  createBuddyApplication,
  createEmailCode,
  createUser,
  deleteEmailCodes,
  findValidEmailCode,
  findUserByEmail,
  findUserProfileById,
  markEmailVerified,
  updateUserPassword,
} from '../repositories/userRepository.js';

export async function register(req, res) {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      homeCountry,
      city,
      studyProgram,
      languages,
      hobbies,
      aboutYou,
      gender,
      genderPreference,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        message: 'Full name, email, password, confirm password and role are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!['international', 'local', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role is invalid.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const buddyStatus = role === 'local' ? 'approved' : 'not_applied';

    const insertedUser = await createUser({
      fullName,
      email,
      passwordHash,
      role,
      homeCountry,
      city,
      studyProgram,
      languages: normalizeArray(languages),
      hobbies: normalizeArray(hobbies),
      aboutYou,
      gender,
      genderPreference,
      buddyStatus,
      emailVerified: true,
    });

    if (role === 'local') {
      await createBuddyApplication(insertedUser.rows[0].id, aboutYou).catch(() => null);
    }

    return res.status(201).json({
      message: 'Account created successfully. Please sign in.',
      user: insertedUser.rows[0],
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Server error while registering.' });
  }
}

export async function registerStart(req, res) {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      homeCountry,
      city,
      studyProgram,
      languages,
      hobbies,
      aboutYou,
      gender,
      genderPreference,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        message: 'Full name, email, password, confirm password and role are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!['international', 'local', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role is invalid.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser.rows.length > 0 && existingUser.rows[0].email_verified) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const code = generateCode();
    await deleteEmailCodes(normalizedEmail, 'verify_email');
    await createEmailCode(normalizedEmail, code, 'verify_email');
    await sendVerificationEmail(normalizedEmail, code);

    return res.status(200).json({
      message: 'Verification code sent to email.',
      pendingUser: {
        fullName,
        email: normalizedEmail,
        password,
        confirmPassword,
        role,
        homeCountry,
        city,
        studyProgram,
        languages,
        hobbies,
        aboutYou,
        gender,
        genderPreference,
      },
    });
  } catch (error) {
    console.error('Register start error:', error.message);
    return res.status(500).json({ message: 'Server error while sending verification code.' });
  }
}

export async function resendVerificationCode(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser.rows.length > 0 && existingUser.rows[0].email_verified) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const code = generateCode();
    await deleteEmailCodes(normalizedEmail, 'verify_email');
    await createEmailCode(normalizedEmail, code, 'verify_email');
    await sendVerificationEmail(normalizedEmail, code);

    return res.status(200).json({ message: 'A new verification code was sent to your email.' });
  } catch (error) {
    console.error('Resend verification code error:', error.message);
    return res.status(500).json({ message: 'Server error while resending verification code.' });
  }
}

export async function registerVerify(req, res) {
  try {
    const {
      code,
      fullName,
      email,
      password,
      confirmPassword,
      role,
      homeCountry,
      city,
      studyProgram,
      languages,
      hobbies,
      aboutYou,
      gender,
      genderPreference,
    } = req.body;

    if (!code || !fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase();
    const codeResult = await findValidEmailCode(normalizedEmail, code, 'verify_email');

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const buddyStatus = role === 'local' ? 'approved' : 'not_applied';

    const insertedUser = await createUser({
      fullName,
      email: normalizedEmail,
      passwordHash,
      role,
      homeCountry,
      city,
      studyProgram,
      languages: normalizeArray(languages),
      hobbies: normalizeArray(hobbies),
      aboutYou,
      gender,
      genderPreference,
      buddyStatus,
      emailVerified: true,
    });

    if (role === 'local') {
      await createBuddyApplication(insertedUser.rows[0].id, aboutYou).catch(() => null);
    }

    await deleteEmailCodes(normalizedEmail, 'verify_email');

    return res.status(201).json({
      message: 'Account created successfully. Please sign in.',
    });
  } catch (error) {
    console.error('Register verify error:', error.message);
    return res.status(500).json({ message: 'Server error while verifying email.' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    const normalizedEmail = email.toLowerCase();
    const userResult = await findUserByEmail(normalizedEmail);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User with this email was not found.' });
    }

    if (userResult.rows[0].email_verified) {
      return res.status(200).json({ message: 'Email is already verified. Please sign in.' });
    }

    const codeResult = await findValidEmailCode(normalizedEmail, code, 'verify_email');
    if (codeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    await markEmailVerified(normalizedEmail);
    await deleteEmailCodes(normalizedEmail, 'verify_email');

    return res.status(200).json({ message: 'Email verified successfully. Please sign in.' });
  } catch (error) {
    console.error('Email verify error:', error.message);
    return res.status(500).json({ message: 'Server error while verifying email.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    const result = await findUserByEmail(email);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.email_verified) {
      const code = generateCode();
      await deleteEmailCodes(user.email, 'verify_email');
      await createEmailCode(user.email, code, 'verify_email');
      await sendVerificationEmail(user.email, code);

      return res.status(403).json({
        message: 'Please verify your email first. A new code was sent to your email.',
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        buddy_status: user.buddy_status,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser.rows.length === 0) {
      return res.status(200).json({ message: 'If this email exists, a reset code was sent.' });
    }

    const code = generateCode();
    await deleteEmailCodes(normalizedEmail, 'reset_password');
    await createEmailCode(normalizedEmail, code, 'reset_password');
    await sendResetEmail(normalizedEmail, code);

    return res.status(200).json({ message: 'If this email exists, a reset code was sent.' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ message: 'Server error while sending reset code.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase();
    const codeResult = await findValidEmailCode(normalizedEmail, code, 'reset_password');

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(normalizedEmail, passwordHash);
    await deleteEmailCodes(normalizedEmail, 'reset_password');

    return res.status(200).json({ message: 'Password reset successful. Please sign in.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ message: 'Server error while resetting password.' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const result = await findUserProfileById(req.user.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Me error:', error.message);
    return res.status(500).json({ message: 'Server error while getting profile.' });
  }
}
