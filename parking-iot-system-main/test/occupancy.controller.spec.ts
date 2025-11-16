import { Test, TestingModule } from '@nestjs/testing';
import { OccupancyController } from '../src/modules/occupancy/occupancy.controller';
import { OccupancyService } from '../src/modules/occupancy/occupancy.service';
import { OccupancyStatus } from '../src/modules/occupancy/occupancy-event.entity';

describe('OccupancyController', () => {
  let occupancyController: OccupancyController;
  let occupancyService: OccupancyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccupancyController],
      providers: [
        {
          provide: OccupancyService,
          useValue: {
            createEvent: jest.fn().mockResolvedValue({ id: '1', status: OccupancyStatus.OCCUPIED }),
            findAll: jest.fn().mockResolvedValue([{ id: '1', status: OccupancyStatus.OCCUPIED }]),
            findById: jest.fn().mockResolvedValue({ id: '1', status: OccupancyStatus.OCCUPIED }),
            updateEvent: jest.fn().mockResolvedValue({ id: '1', status: OccupancyStatus.FREE }),
            softDelete: jest.fn().mockResolvedValue(true),
            getHistory: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    occupancyController = module.get<OccupancyController>(OccupancyController);
    occupancyService = module.get<OccupancyService>(OccupancyService);
  });

  it('should be defined', () => {
    expect(occupancyController).toBeDefined();
  });

  it('should create an occupancy event', async () => {
    const body = { parkingSpaceId: '1', status: OccupancyStatus.OCCUPIED };
    const result = await occupancyController.createEvent(body);
    expect(result).toHaveProperty('message');
  });

  it('should return all occupancy events', async () => {
    const result = await occupancyController.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('id');
  });

  it('should return occupancy event by id', async () => {
    const result = await occupancyController.findById('1');
    expect(result).toHaveProperty('id');
  });

  it('should update an occupancy event', async () => {
    const body = { status: OccupancyStatus.FREE };
    const result = await occupancyController.updateEvent('1', body);
    expect(result).toHaveProperty('message');
    expect(result.event && result.event.status).toBe(OccupancyStatus.FREE);
  });

  it('should soft delete an occupancy event', async () => {
    const result = await occupancyController.softDelete('1');
    expect(result).toHaveProperty('message');
  });

  it('should return an array of occupancy events (history)', async () => {
    const result = await occupancyController.getHistory('test-id');
    expect(result).toEqual([]);
  });
});
