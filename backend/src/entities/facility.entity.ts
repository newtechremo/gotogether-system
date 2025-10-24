import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';
import { FacilityDevice } from './facility-device.entity';
import { FacilityDeviceItem } from './facility-device-item.entity';
import { FacilityRental } from './facility-rental.entity';
import { FacilityRepair } from './facility-repair.entity';

@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'facility_code' })
  facilityCode: string;

  @Column({ type: 'varchar', length: 200, name: 'facility_name' })
  facilityName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'manager_name',
  })
  managerName: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'manager_phone',
  })
  managerPhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'int', name: 'created_by', nullable: true })
  createdBy: number;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: AdminUser;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true, default: null })
  deletedAt: Date;

  @OneToMany(() => FacilityDevice, (device) => device.facility)
  facilityDevices: FacilityDevice[];

  @OneToMany(() => FacilityDeviceItem, (deviceItem) => deviceItem.facility)
  deviceItems: FacilityDeviceItem[];

  @OneToMany(() => FacilityRental, (rental) => rental.facility)
  facilityRentals: FacilityRental[];

  @OneToMany(() => FacilityRepair, (repair) => repair.facility)
  facilityRepairs: FacilityRepair[];
}
