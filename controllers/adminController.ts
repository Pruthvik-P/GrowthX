import { Request, Response } from 'express';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

// Register a new admin
export const registerAdmin: express.RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      res.status(400).json({ message: 'Admin already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({
      id: admin.id,
      username: admin.username,
      token: generateToken(admin.id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin' });
  }
};

// Admin login
export const loginAdmin: express.RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      id: admin.id,
      username: admin.username,
      token: generateToken(admin.id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get assignments tagged to the admin
export const getAssignments = async (req: Request, res: Response) => {
  const adminId = req.body.user?.id;

  try {
    const assignments = await prisma.assignment.findMany({
      where: { adminId },
      include: { user: true },
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

// Accept or reject an assignment
export const reviewAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: { status },
    });

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment' });
  }
};
