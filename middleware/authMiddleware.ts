import { Request, Response, NextFunction } from 'express';
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

interface  AuthRequest extends Request{
    user?: { id: string; role: string };
}

export const authenticate: express.RequestHandler = async (req:AuthRequest, res:Response, next:NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };

        //fetch user or admin from database
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });

        if(!user && !admin){
            res.status(401).json({ message: 'Unauthorized'});
            return;
        }

        req.user = { id: decoded.id, role: decoded.role};
        next();
    } catch (error){
        res.status(401).json({ message : "Invalid token"})
    }
}