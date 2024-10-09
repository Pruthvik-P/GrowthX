import { Request, Response } from 'express';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

// Register a new user
export const registerUser: express.RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      token: generateToken(user.id, 'user'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

// User login
export const loginUser: express.RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      token: generateToken(user.id, 'user'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Upload an assignment
export const uploadAssignment: express.RequestHandler = async (req: Request, res: Response) => {
  const { userId, task, adminId } = req.body;

  try {
    const assignment = await prisma.assignment.create({
      data: {
        task,
        user: { connect: { id: userId } },
        admin: { connect: { id: adminId } },
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading assignment' });
  }
};
