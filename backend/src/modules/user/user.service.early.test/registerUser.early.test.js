import nodemailer from 'nodemailer';

import bcrypt from "bcrypt";
import User from "../user.model.js";
import { registerUser } from '../user.service';

jest.mock("../user.model.js");
jest.mock('bcrypt');

describe('registerUser() registerUser method', () => {
  let mockTransporter;
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_USER = 'testuser@example.com';
    process.env.EMAIL_PASS = 'testpass';

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(true),
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  afterAll(() => {
    process.env = originalEnv;
  });


  it('should register a user successfully with all valid fields', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    User.create.mockImplementation(async (userObj) => ({
      ...userObj,
      _id: 'mockedid',
    }));

    const user = await registerUser(data);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ email: data.email }, { studentID: Number(data.studentID) }],
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(data.password, 10);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentID: data.studentID,
        name: data.name,
        email: data.email,
        password: 'hashedPassword123',
        yearOfStudy: data.yearOfStudy,
        role: data.role,
        isVerified: false,
        verificationOTP: expect.any(String),
        verificationOTPExpires: expect.any(Number),
      })
    );
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: expect.stringContaining('Verify'),
        html: expect.stringContaining('Verify Your Account'),
      })
    );
    expect(user).toHaveProperty('studentID', data.studentID);
    expect(user).toHaveProperty('email', data.email);
    expect(user).toHaveProperty('isVerified', false);
    expect(user).toHaveProperty('verificationOTP', expect.any(String));
    expect(user).toHaveProperty('verificationOTPExpires', expect.any(Number));
  });

  it('should allow registration with a custom role', async () => {
    const data = {
      studentID: 22222,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password456',
      yearOfStudy: 3,
      role: 'admin',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword456');
    User.create.mockImplementation(async (userObj) => ({
      ...userObj,
      _id: 'mockedid2',
    }));

    const user = await registerUser(data);

    expect(user.role).toBe('admin');
  });


  it('should throw an error if any required field is missing', async () => {
    const requiredFields = ['studentID', 'name', 'email', 'password', 'yearOfStudy'];
    for (const field of requiredFields) {
      const data = {
        studentID: 123,
        name: 'Test',
        email: 'test@example.com',
        password: 'pass',
        yearOfStudy: 1,
        role: 'student',
      };
      delete data[field];
      await expect(registerUser(data)).rejects.toThrow('All fields are required');
    }
  });

  it('should throw an error if email is already registered', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue({
      email: data.email,
      studentID: 99999,
    });

    await expect(registerUser(data)).rejects.toThrow('This email is already registered. Please login.');
    expect(User.findOne).toHaveBeenCalled();
  });

  it('should throw an error if studentID is already registered', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue({
      email: 'other@example.com',
      studentID: Number(data.studentID),
    });

    await expect(registerUser(data)).rejects.toThrow('This Student ID is already registered.');
    expect(User.findOne).toHaveBeenCalled();
  });

  it('should throw if bcrypt.hash fails', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockRejectedValue(new Error('bcrypt error'));

    await expect(registerUser(data)).rejects.toThrow('bcrypt error');
  });

  it('should throw if User.create fails', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockRejectedValue(new Error('DB error'));

    await expect(registerUser(data)).rejects.toThrow('DB error');
  });

  it('should throw if nodemailer.createTransport fails', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockResolvedValue({
      ...data,
      _id: 'mockedid',
    });
    nodemailer.createTransport.mockImplementation(() => {
      throw new Error('Transport error');
    });

    await expect(registerUser(data)).rejects.toThrow('Transport error');
  });

  it('should throw if transporter.sendMail fails', async () => {
    const data = {
      studentID: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      yearOfStudy: 2,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockResolvedValue({
      ...data,
      _id: 'mockedid',
    });
    mockTransporter.sendMail.mockRejectedValue(new Error('Mail error'));

    await expect(registerUser(data)).rejects.toThrow('Mail error');
  });

  it('should convert studentID to number if passed as string', async () => {
    const data = {
      studentID: '55555',
      name: 'String ID',
      email: 'stringid@example.com',
      password: 'password',
      yearOfStudy: 1,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockImplementation(async (userObj) => ({
      ...userObj,
      _id: 'mockedid',
    }));

    await registerUser(data);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ email: data.email }, { studentID: Number(data.studentID) }],
    });
  });

  it('should set verificationOTP as a 6-digit string', async () => {
    const data = {
      studentID: 99999,
      name: 'OTP User',
      email: 'otpuser@example.com',
      password: 'password',
      yearOfStudy: 4,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    let createdUser;
    User.create.mockImplementation(async (userObj) => {
      createdUser = userObj;
      return { ...userObj, _id: 'mockedid' };
    });

    await registerUser(data);

    expect(createdUser.verificationOTP).toMatch(/^\d{6}$/);
  });

  it('should set verificationOTPExpires to about 10 minutes in the future', async () => {
    const data = {
      studentID: 88888,
      name: 'Expiry User',
      email: 'expiry@example.com',
      password: 'password',
      yearOfStudy: 4,
      role: 'student',
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    let createdUser;
    User.create.mockImplementation(async (userObj) => {
      createdUser = userObj;
      return { ...userObj, _id: 'mockedid' };
    });

    const before = Date.now();
    await registerUser(data);
    const after = Date.now();

    expect(createdUser.verificationOTPExpires).toBeGreaterThanOrEqual(before + 10 * 60 * 1000 - 1000);
    expect(createdUser.verificationOTPExpires).toBeLessThanOrEqual(after + 10 * 60 * 1000 + 1000);
  });
});