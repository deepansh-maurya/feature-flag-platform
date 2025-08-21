import { CreateUserDto, GetUserByEmailDto, SoftDeleteUserDto, UpdateUserDto, UserDto } from '../../interface/dto/create-usersmodule.dto'
export const USER_REPO = Symbol('USER_REPO');

export interface UserRepo {
  createUser(input: CreateUserDto): Promise<UserDto>;
  findById(id: string): Promise<UserDto | null>;
  findByEmail(input: GetUserByEmailDto): Promise<UserDto | null>;
  updateUser(input: UpdateUserDto): Promise<UserDto>;
  softDeleteUser(input: SoftDeleteUserDto): Promise<void>;
}
