import { Inject, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  GetUserByEmailDto,
  SoftDeleteUserDto,
  UpdateUserDto,
} from '../../interface/dto/create-usersmodule.dto';
import { USER_REPO, UserRepo } from '../ports/usersmodule.repo';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPO) private readonly repo: UserRepo) {}

  createUser(dto: CreateUserDto) {
    return this.repo.createUser(dto);
  }
  findById(id: string) {
    return this.repo.findById(id);
  }
  findByEmail(dto: GetUserByEmailDto) {
    return this.repo.findByEmail(dto);
  }
  updateUser(dto: UpdateUserDto) {
    return this.repo.updateUser(dto);
  }
  softDeleteUser(dto: SoftDeleteUserDto) {
    return this.repo.softDeleteUser(dto);
  }
}
