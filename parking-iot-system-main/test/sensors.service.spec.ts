import { Test, TestingModule } from '@nestjs/testing';
import { SensorsService } from '../src/modules/sensors/sensors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sensor } from '../src/modules/sensors/sensor.entity';
import { ParkingSpace } from '../src/modules/parking/parking.entity';
import { OccupancyEvent } from '../src/modules/occupancy/occupancy-event.entity';
import { CreateSensorDto } from '../src/modules/sensors/dto/create-sensor.dto';
import { UpdateSensorDto } from '../src/modules/sensors/dto/update-sensor.dto';

const mockSensorRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});
const mockParkingRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});
const mockOccupancyRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
});
const mockMqttClient = () => ({
  connect: jest.fn(),
});

describe('SensorsService', () => {
  let service: SensorsService;
  let sensorRepo;
  let parkingRepo;
  let occupancyRepo;
  let mqttClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorsService,
        { provide: getRepositoryToken(Sensor), useFactory: mockSensorRepo },
        { provide: getRepositoryToken(ParkingSpace), useFactory: mockParkingRepo },
        { provide: getRepositoryToken(OccupancyEvent), useFactory: mockOccupancyRepo },
        { provide: 'MQTT_SERVICE', useFactory: mockMqttClient },
      ],
    }).compile();

    service = module.get<SensorsService>(SensorsService);
    sensorRepo = module.get(getRepositoryToken(Sensor));
    parkingRepo = module.get(getRepositoryToken(ParkingSpace));
    occupancyRepo = module.get(getRepositoryToken(OccupancyEvent));
    mqttClient = module.get('MQTT_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a sensor', async () => {
    const dto: CreateSensorDto = { hwId: 'hw1' } as any;
    const mockSensor = { id: '1', hwId: 'hw1' };
    sensorRepo.create.mockReturnValue(mockSensor);
    sensorRepo.save.mockResolvedValue(mockSensor);
    const result = await service.createSensor(dto);
    expect(sensorRepo.create).toHaveBeenCalledWith(expect.objectContaining({ hwId: 'hw1' }));
    expect(sensorRepo.save).toHaveBeenCalledWith(mockSensor);
    expect(result).toEqual(mockSensor);
  });

  it('should update a sensor', async () => {
    const dto: UpdateSensorDto = { locationDescription: 'new' };
    const mockSensor = { id: '1', locationDescription: 'old' };
    sensorRepo.findOne.mockResolvedValue(mockSensor);
    sensorRepo.save.mockResolvedValue({ ...mockSensor, locationDescription: 'new' });
    const result = await service.updateSensor('1', dto);
    expect(sensorRepo.save).toHaveBeenCalledWith({ ...mockSensor, locationDescription: 'new' });
    expect(result.locationDescription).toBe('new');
  });

  it('should throw if sensor not found on update', async () => {
    sensorRepo.findOne.mockResolvedValue(null);
    await expect(service.updateSensor('1', { locationDescription: 'x' })).rejects.toThrow('Sensor no encontrado');
  });
});
