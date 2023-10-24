import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from 'src/core/entities';
import { MockDatabaseModule } from 'src/services/mock-database/mock-database.module';
import { InsertResult, Repository } from 'typeorm';
import { TypeOrmProfileService } from '../typeorm-profile.service';

describe('TypeOrmProfileService', () => {
  let service: TypeOrmProfileService;
  let repo: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MockDatabaseModule, TypeOrmModule.forFeature([Profile])],
      providers: [TypeOrmProfileService],
    }).compile();

    service = module.get<TypeOrmProfileService>(TypeOrmProfileService);
    repo = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  it('should return a profile for a given user ID', async () => {
    const userId = 1;
    const profile = new Profile();
    jest.spyOn(repo, 'findOne').mockResolvedValue(profile);

    const result = await service.findByUser(userId);

    expect(result).toEqual(profile);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        user: {
          id: userId,
        },
      },
    });
  });

  it('should create a profile', async () => {
    const profile = Profile.create();

    jest.spyOn(repo, 'insert').mockResolvedValue({
      identifiers: [{ id: 1 }],
    } as unknown as InsertResult);

    jest.spyOn(repo, 'findOne').mockResolvedValue(profile);

    const result = await service.createProfile(profile);

    expect(result).toEqual(profile);
    expect(repo.insert).toHaveBeenCalledWith(profile);
  });

  it('should update a profile', async () => {
    const profileId = 1;
    const profile = new Profile();
    jest.spyOn(repo, 'save').mockResolvedValue(profile);

    const result = await service.updateProfile(profileId, profile);

    expect(result).toEqual(profile);
    expect(repo.save).toHaveBeenCalledWith({
      id: profileId,
      ...profile,
    });
  });

  it('should delete a profile', async () => {
    const profileId = 1;
    jest.spyOn(repo, 'delete').mockResolvedValue(undefined);

    await service.deleteProfile(profileId);

    expect(repo.delete).toHaveBeenCalledWith(profileId);
  });
});
