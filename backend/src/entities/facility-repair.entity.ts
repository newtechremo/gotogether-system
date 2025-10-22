import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Facility } from './facility.entity';
import { FacilityDeviceItem } from './facility-device-item.entity';

@Entity('facility_repairs')
export class FacilityRepair {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facility_id' })
  facilityId: number;

  @Column({ name: 'device_item_id', nullable: true })
  deviceItemId: number;

  @Column({ name: 'device_type', length: 50 })
  deviceType: string;

  @Column({ name: 'reporter_name', length: 100, nullable: true })
  reporterName: string;

  @Column({ name: 'issue_description', type: 'text' })
  issueDescription: string;

  @Column({
    type: 'enum',
    enum: ['수리접수', '수리중', '수리완료'],
    default: '수리접수',
  })
  status: string;

  @Column({ name: 'repair_start_date', type: 'datetime', nullable: true })
  repairStartDate: Date;

  @Column({ name: 'repair_end_date', type: 'datetime', nullable: true })
  repairEndDate: Date;

  @Column({
    name: 'repair_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  repairCost: number;

  @Column({ name: 'repair_vendor', length: 200, nullable: true })
  repairVendor: string;

  @Column({ name: 'repair_notes', type: 'text', nullable: true })
  repairNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.facilityRepairs)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => FacilityDeviceItem, (deviceItem) => deviceItem.repairs)
  @JoinColumn({ name: 'device_item_id' })
  deviceItem: FacilityDeviceItem;
}
