import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { FacilityRental } from './facility-rental.entity';
import { FacilityDeviceItem } from './facility-device-item.entity';

@Entity('facility_rental_devices')
export class FacilityRentalDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rental_id' })
  rentalId: number;

  @Column({ name: 'device_item_id', nullable: true })
  deviceItemId: number;

  @Column({ name: 'device_type', length: 50 })
  deviceType: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'is_returned', default: false })
  isReturned: boolean;

  @Column({ name: 'return_datetime', type: 'datetime', nullable: true })
  returnDatetime: Date;

  @Column({ name: 'return_condition', length: 100, nullable: true })
  returnCondition: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => FacilityRental, (rental) => rental.rentalDevices)
  @JoinColumn({ name: 'rental_id' })
  rental: FacilityRental;

  @ManyToOne(() => FacilityDeviceItem, (deviceItem) => deviceItem.rentalDevices)
  @JoinColumn({ name: 'device_item_id' })
  deviceItem: FacilityDeviceItem;
}
