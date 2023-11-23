import { Plant } from 'src/plant/entities/plant.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Plant, (plant) => plant.category, { onDelete: 'CASCADE' })
  plants: Plant[];
}
