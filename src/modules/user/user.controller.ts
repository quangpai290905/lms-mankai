/*import { Controller, Get, Param, Delete, UseGuards, ParseIntPipe, Patch, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../shared/guard/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../auth/database/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';

@ApiTags('2. Users (Admin)')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Thành công.'})
  @ApiResponse({ status: 403, description: 'Không có quyền.'})
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin một người dùng theo ID (Admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật quyền cho người dùng (Admin)' })
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, updateUserRoleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa một người dùng (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
  */
