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
import { Kiosk } from '../kiosk/entities/kiosk.entity';
import { KioskRental } from './kiosk-rental.entity';

export enum KioskDeviceType {
  AR_GLASS = 'AR_GLASS',
  BONE_CONDUCTION = 'BONE_CONDUCTION',
  SMARTPHONE = 'SMARTPHONE',
}

export enum KioskDeviceStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  BROKEN = 'broken',
}

@Entity('kiosk_devices')
export class KioskDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    name: 'serial_number',
  })
  serialNumber: string;

  @Column({
    type: 'enum',
    enum: KioskDeviceType,
    name: 'device_type',
  })
  deviceType: KioskDeviceType;

  @Column({
    type: 'int',
    name: 'box_number',
    comment: '키오스크 보관함 번호',
  })
  boxNumber: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'nfc_tag_id',
    comment: 'NFC 태그 ID',
  })
  nfcTagId: string;

  @Column({ name: 'kiosk_id' })
  kioskId: number;

  @ManyToOne(() => Kiosk, (kiosk) => kiosk.devices)
  @JoinColumn({ name: 'kiosk_id' })
  kiosk: Kiosk;

  @Column({
    type: 'enum',
    enum: KioskDeviceStatus,
    default: KioskDeviceStatus.AVAILABLE,
  })
  status: KioskDeviceStatus;

  @Column({
    type: 'date',
    name: 'purchase_date',
    nullable: true,
    comment: '구매일',
  })
  purchaseDate: Date | null;

  @Column({
    type: 'date',
    name: 'last_maintenance_date',
    nullable: true,
  })
  lastMaintenanceDate: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KioskRental, (rental) => rental.device)
  rentals: KioskRental[];
}
