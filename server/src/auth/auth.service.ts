import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();
@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async register(registerDto: Prisma.UserCreateInput) {
    try {
      const ExistingUser = await prisma.user.findUnique({
        where: {
          email: registerDto.email,
        },
      });
      if (ExistingUser) {
        throw new Error('Credentials already taken brauh');
      }
      const hashedPassword = await argon2.hash(registerDto.password);
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          password: hashedPassword,
        },
      });
      delete user.password;
      return { user };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Email already exists');
        }
      }
      throw new Error('An error occurred');
    }
  }

  async login(loginDto: Prisma.UserCreateInput) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: loginDto.email,
        },
      });
      if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }
      const pwMatched = await argon2.verify(user.password, loginDto.password);
      if (!pwMatched) {
        throw new ForbiddenException('Invalid credentials');
      }
      const payload = { email: user.email, username: user.username };
      const token = await this.signToken(payload);
      return {
        message: 'Successfully logged in!',
        access_token: token,
        user: {
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async signToken(payload: { email: string; username: string }) {
    const secret = this.config.get('SECRET');
    return await this.jwt.signAsync(
      {
        email: payload.email,
        username: payload.username,
      },
      {
        expiresIn: '12h',
        secret: secret,
      },
    );
  }
}
