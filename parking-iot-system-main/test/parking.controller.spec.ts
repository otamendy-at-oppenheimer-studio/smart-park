import { Test, TestingModule } from '@nestjs/testing';
import { ParkingController } from '../src/modules/parking/parking.controller';
import { ParkingService } from '../src/modules/parking/parking.service';
import { SpaceStatus } from '../src/modules/parking/parking.entity';

describe('ParkingController', () => {
  let parkingController: ParkingController;
  let parkingService: ParkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingController],
      providers: [
        {
          provide: ParkingService,
          useValue: {
            getAllSpaces: jest.fn().mockResolvedValue([{ id: '1', spaceCode: 'A-01', status: SpaceStatus.FREE }]),
            getSpaceById: jest.fn().mockResolvedValue({ id: '1', spaceCode: 'A-01', status: SpaceStatus.FREE }),
            createSpace: jest.fn().mockResolvedValue({ id: '2', spaceCode: 'A-02', status: SpaceStatus.FREE }),
            updateSpace: jest.fn().mockResolvedValue({ id: '1', spaceCode: 'A-01', status: SpaceStatus.OCCUPIED }),
            softDeleteSpace: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    parkingController = module.get<ParkingController>(ParkingController);
    parkingService = module.get<ParkingService>(ParkingService);
  });

  it('should be defined', () => {
    expect(parkingController).toBeDefined();
  });

  it('should return all parking spaces', async () => {
    const result = await parkingController.getAllSpaces();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('id');
  });

  it('should return parking space by id', async () => {
    const result = await parkingController.getSpaceById('1');
    expect(result).toHaveProperty('id');
  });

  it('should create a parking space', async () => {
    const body = { status: SpaceStatus.FREE, floor: '1' };
    const result = await parkingController.createSpace(body);
    expect(result).toHaveProperty('message');
    expect(result.space && result.space.id).toBeDefined();
  });

  it('should update a parking space', async () => {
    const body = { status: SpaceStatus.OCCUPIED };
    const result = await parkingController.updateSpace('1', body);
    expect(result).toHaveProperty('message');
    expect(result.space && result.space.status).toBe(SpaceStatus.OCCUPIED);
  });

  it('should soft delete a parking space', async () => {
    const result = await parkingController.softDeleteSpace('1');
    expect(result).toHaveProperty('message');
  });
});
