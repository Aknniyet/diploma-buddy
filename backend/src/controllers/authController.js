import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import { normalizeArray } from '../services/arrayUtils.js';
import {
  createBuddyApplication,
  createUser,
  findUserByEmail,
  findUserProfileById,
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

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
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

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await findUserByEmail(email);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
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
