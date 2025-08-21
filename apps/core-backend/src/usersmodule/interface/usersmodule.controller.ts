import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from '../application/use-cases/usersmodule.service';
import { CreateUserDto, GetUserByEmailDto, SoftDeleteUserDto, UpdateUserDto } from './dto/create-usersmodule.dto';

@Controller('users')
export class UserController {
  constructor(private readonly svc: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.svc.createUser(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get()
  getByEmail(@Query() q: GetUserByEmailDto) {
    return this.svc.findByEmail(q);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.updateUser({ ...dto, id });
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    const dto: SoftDeleteUserDto = { id };
    return this.svc.softDeleteUser(dto);
  }
}
