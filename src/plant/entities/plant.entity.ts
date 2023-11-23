import { Category } from 'src/category/entities/category.entity';
import { PlantCharacteristic } from 'src/core/interfaces/plant-characteristic.interface';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Plant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  pictures: string[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  characteristics: PlantCharacteristic[];

  @ManyToOne(() => Category, (category) => category.plants, {
    onDelete: 'CASCADE',
  })
  category: Category;
}
