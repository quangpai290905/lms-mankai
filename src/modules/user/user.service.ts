/*import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/database/user.entity';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'user_id',
        'full_name',
        'email',
        'phone',
        'role',
        'created_at',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { user_id: id },
      select: [
        'user_id',
        'full_name',
        'email',
        'phone',
        'role',
        'created_at',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateRole(id: number, updateUserRoleDto: UpdateUserRoleDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ user_id: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.role = updateUserRoleDto.role;
    await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been deleted` };
  }
}
  */
