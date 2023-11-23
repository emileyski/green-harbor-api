import { Plant } from 'src/plant/entities/plant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Supply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  count: number;

  @Column()
  currentCount: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  price: number;

  @Column()
  supplierName: string;

  @Column()
  supplierPhone: string;

  @Column()
  supplierAddress: string;

  @Column()
  supplierEmail: string;

  @Column()
  expirationDate: Date;

  @Column({ default: new Date() })
  deliveryDate: Date;

  @Column({ default: false })
  inSale: boolean;

  @ManyToOne(() => Plant, (plant) => plant.supplies, {
    onDelete: 'CASCADE',
  })
  plant: Plant;
}
