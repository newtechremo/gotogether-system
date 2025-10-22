import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Facility } from './facility.entity';
import { FacilityRentalDevice } from './facility-rental-device.entity';
import { FacilityRepair } from './facility-repair.entity';

@Entity('facility_device_items')
export class FacilityDeviceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facility_id' })
  facilityId: number;

  @Column({
    type: 'enum',
    enum: ['AR글라스', '골전도 이어폰', '스마트폰', '기타'],
    name: 'device_type',
  })
  deviceType: string;

  @Column({ name: 'device_code', unique: true })
  deviceCode: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({
    type: 'enum',
    enum: ['available', 'rented', 'broken', 'maintenance'],
    default: 'available',
  })
  status: string;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.deviceItems)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @OneToMany(
    () => FacilityRentalDevice,
    (rentalDevice) => rentalDevice.deviceItem,
  )
  rentalDevices: FacilityRentalDevice[];

  @OneToMany(() => FacilityRepair, (repair) => repair.deviceItem)
  repairs: FacilityRepair[];
}
