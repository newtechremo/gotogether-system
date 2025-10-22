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
import { FacilityDevice } from './facility-device.entity';
import { FacilityRentalDevice } from './facility-rental-device.entity';
import { FacilityRepair } from './facility-repair.entity';

@Entity('facility_device_items')
export class FacilityDeviceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facility_device_id' })
  facilityDeviceId: number;

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

  @ManyToOne(
    () => FacilityDevice,
    (facilityDevice) => facilityDevice.deviceItems,
  )
  @JoinColumn({ name: 'facility_device_id' })
  facilityDevice: FacilityDevice;

  @OneToMany(
    () => FacilityRentalDevice,
    (rentalDevice) => rentalDevice.deviceItem,
  )
  rentalDevices: FacilityRentalDevice[];

  @OneToMany(() => FacilityRepair, (repair) => repair.deviceItem)
  repairs: FacilityRepair[];
}
