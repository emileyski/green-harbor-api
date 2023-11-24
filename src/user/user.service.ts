import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await hash(createUserDto.password);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      throw new ConflictException('Some error occured while creating user');
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    delete user.password;
    delete user.token;

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    try {
      this.userRepository.merge(user, { token: refreshToken });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new ConflictException(
        'Some error occured while updating user token',
      );
    }
  }
}
