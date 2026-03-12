import { DataSource } from 'typeorm';
import { Vocabulary } from 'src/modules/vocabulary/entity/vocabulary.entity';
import { Topic } from 'src/modules/topic/entity/topic.entity';

export async function seedVocabulary(dataSource: DataSource) {
  const vocabRepo = dataSource.getRepository(Vocabulary);
  const topicRepo = dataSource.getRepository(Topic);

  const topic = await topicRepo.findOne({
    where: { name: 'Chào hỏi' },
  });

  if (!topic) return;

  const data = [
    { word: 'こんにちは', meaning: 'Xin chào', level: 'N5' },
    { word: 'ありがとう', meaning: 'Cảm ơn', level: 'N5' },
    { word: 'さようなら', meaning: 'Tạm biệt', level: 'N5' },
  ];

  for (const v of data) {
    await vocabRepo.save(vocabRepo.create({ ...v, topic }));
  }
}
