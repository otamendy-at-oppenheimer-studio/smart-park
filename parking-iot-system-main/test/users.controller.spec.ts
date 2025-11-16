
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/modules/users/users.controller';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/modules/users/user.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: '1', email: 'a@a.com', role: UserRole.ADMIN }]),
            findById: jest.fn().mockResolvedValue({ id: '1', email: 'a@a.com', role: UserRole.ADMIN }),
            createUser: jest.fn().mockResolvedValue({ id: '2', email: 'b@b.com', role: UserRole.USER }),
            updateUser: jest.fn().mockResolvedValue({ id: '1', email: 'edit@a.com', role: UserRole.ADMIN }),
            softDeleteUser: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('should return all users', async () => {
    const result = await usersController.findAll();
    expect(result).toEqual([{ id: '1', email: 'a@a.com', role: 'admin' }]);
  });

  it('should return user by id', async () => {
    const result = await usersController.findById('1');
    expect(result).toEqual({ id: '1', email: 'a@a.com', role: 'admin' });
  });

  it('should create a user', async () => {
  const body = { email: 'b@b.com', password: '123', role: UserRole.USER };
  const result = await usersController.create(body);
  expect(result).toHaveProperty('message');
  expect(result.user && result.user.id).toBeDefined();
  });

  it('should update a user', async () => {
    const body = { email: 'edit@a.com' };
    const result = await usersController.update('1', body);
    expect(result).toHaveProperty('message');
  expect(result.user && result.user.email).toBe('edit@a.com');
  });

  it('should soft delete a user', async () => {
    const result = await usersController.softDelete('1');
    expect(result).toHaveProperty('message');
  });
});
