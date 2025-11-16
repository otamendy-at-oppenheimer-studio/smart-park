import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../src/modules/reports/reports.controller';
import { ReportsService } from '../src/modules/reports/reports.service';

describe('ReportsController', () => {
  let reportsController: ReportsController;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getReports: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    reportsController = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(reportsController).toBeDefined();
  });

  it('should return an array of reports', async () => {
    const result = await reportsController.getAll();
    expect(result).toEqual([]);
  });
});
