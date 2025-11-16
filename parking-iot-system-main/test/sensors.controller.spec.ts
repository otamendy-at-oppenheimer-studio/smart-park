import { Test, TestingModule } from '@nestjs/testing';
import { SensorsController } from '../src/modules/sensors/sensors.controller';
import { SensorsService } from '../src/modules/sensors/sensors.service';
import { SensorType } from '../src/modules/sensors/sensor.entity';

describe('SensorsController', () => {
  let sensorsController: SensorsController;
  let sensorsService: SensorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorsController],
      providers: [
        {
          provide: SensorsService,
          useValue: {
            createSensor: jest.fn().mockResolvedValue({ id: '1', hwId: 'hw1', type: SensorType.ULTRASONIC }),
            findAll: jest.fn().mockResolvedValue([{ id: '1', hwId: 'hw1', type: SensorType.ULTRASONIC }]),
            findById: jest.fn().mockResolvedValue({ id: '1', hwId: 'hw1', type: SensorType.ULTRASONIC }),
            updateSensor: jest.fn().mockResolvedValue({ id: '1', hwId: 'hw1', type: SensorType.ULTRASONIC, locationDescription: 'edit' }),
            softDelete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    sensorsController = module.get<SensorsController>(SensorsController);
    sensorsService = module.get<SensorsService>(SensorsService);
  });

  it('should be defined', () => {
    expect(sensorsController).toBeDefined();
  });

  it('should create a sensor', async () => {
    const body = { hwId: 'hw1', type: SensorType.ULTRASONIC };
    const result = await sensorsController.createSensor(body);
    expect(result).toHaveProperty('message');
    expect(result.sensor && result.sensor.id).toBeDefined();
  });

  it('should return all sensors', async () => {
    const result = await sensorsController.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('id');
  });

  it('should return sensor by id', async () => {
    const result = await sensorsController.findById('1');
    expect(result).toHaveProperty('id');
  });

  it('should update a sensor', async () => {
    const body = { locationDescription: 'edit' };
    const result = await sensorsController.updateSensor('1', body);
    expect(result).toHaveProperty('message');
    expect(result.sensor && result.sensor.locationDescription).toBe('edit');
  });

  it('should soft delete a sensor', async () => {
    const result = await sensorsController.softDelete('1');
    expect(result).toHaveProperty('message');
  });
});
