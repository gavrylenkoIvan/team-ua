import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/core/entities';
import { Repository } from 'typeorm';

import { TypeOrmUserService } from '../typeorm-user.service';

describe('TypeOrmUserService', () => {
  let service: TypeOrmUserService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const repoToken = getRepositoryToken(User);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserService,
        {
          provide: repoToken,
          useValue: createMock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<TypeOrmUserService>(TypeOrmUserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const user = createMock<User>();
    jest.spyOn(repo, 'save').mockResolvedValue(user);

    const result = await service.create(user);

    expect(result).toEqual(user);
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  it('should update a user', async () => {
    const userId = 1;
    const user = createMock<User>({
      id: userId,
    });

    jest
      .spyOn(repo, 'update')
      .mockImplementationOnce(() => Promise.resolve(undefined));
    jest.spyOn(repo, 'findOneBy').mockResolvedValue(user);

    const result = await service.update(userId, user);

    expect(result).toEqual(user);
    expect(repo.update).toHaveBeenCalledWith(userId, user);
    expect(repo.findOneBy).toHaveBeenCalledWith({
      id: user.id,
    });
  });
});
