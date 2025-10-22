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
import { FacilityDeviceItem } from './facility-device-item.entity';

@Entity('facility_devices')
export class FacilityDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facility_id' })
  facilityId: number;

  @Column({
    type: 'enum',
    enum: ['AR글라스', '골전도 이어폰', '스마트폰'],
    name: 'device_type',
  })
  deviceType: string;

  @Column({ name: 'qty_total', default: 0 })
  qtyTotal: number;

  @Column({ name: 'qty_available', default: 0 })
  qtyAvailable: number;

  @Column({ name: 'qty_rented', default: 0 })
  qtyRented: number;

  @Column({ name: 'qty_broken', default: 0 })
  qtyBroken: number;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.facilityDevices)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  // Note: facility_device_items now directly references facilities, not facility_devices
  // This relationship is kept for backward compatibility but may not be used
  // @OneToMany(
  //   () => FacilityDeviceItem,
  //   (deviceItem) => deviceItem.facilityDevice,
  // )
  // deviceItems: FacilityDeviceItem[];
}
