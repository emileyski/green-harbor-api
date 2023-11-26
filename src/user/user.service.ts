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
import { Roles } from 'src/core/enums/roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return (await this.userRepository.find()).map((user) => {
      delete user.password;

      const authorized = !!user.token;

      delete user.token;

      return { ...user, authorized };
    });
  }

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

  //#region update actions

  async updateName(id: string, name: string) {
    const updateResult = await this.userRepository.update(id, { name });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.findOne({ where: { id } });
  }

  async updateEmail(id: string, email: string) {
    const emailIsValid = /^\S+@\S+\.\S+$/.test(email);

    if (!emailIsValid) throw new ConflictException('Invalid email');

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) throw new ConflictException('Email already taken');

    const updateResult = await this.userRepository.update(id, { email });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.findOne({ where: { id } });
  }

  getRegistrationStatistics() {
    return this.userRepository.query(
      `SELECT DATE_TRUNC('day', "createdAt") AS "date", COUNT(*) AS "count" FROM "user" GROUP BY DATE_TRUNC('day', "createdAt") ORDER BY DATE_TRUNC('day', "createdAt")`,
    );
  }

  async updateAsAdmin(id: string, updateDto: any) {
    console.log(updateDto);

    const updateResult = await this.userRepository.update(id, {
      ...updateDto,
      role: updateDto.role === 'ADMIN' ? Roles.ADMIN : Roles.BUYER,
    });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.findOne({ where: { id } });
  }

  async updatePassword(id: string, password: string) {
    const hashedPassword = await hash(password);

    const updateResult = await this.userRepository.update(id, {
      password: hashedPassword,
    });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.findOne({ where: { id } });
  }

  async updatePhone(id: string, phone: string) {
    const phoneIsValid = /^\+380\d{9}$/.test(phone);

    if (!phoneIsValid) throw new ConflictException('Invalid phone number');

    const updateResult = await this.userRepository.update(id, {
      mobilePhone: phone,
    });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.findOne({ where: { id } });
  }

  async updateRole(id: string, role: Roles) {
    const updateResult = await this.userRepository.update(id, { role });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.findOne({ where: { id } });
  }

  //#endregion
}
