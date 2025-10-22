import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KioskDevice } from './kiosk-device.entity';
import { Kiosk } from '../kiosk/entities/kiosk.entity';

export enum KioskRentalStatus {
  RENTED = 'rented',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}

@Entity('kiosk_rentals')
export class KioskRental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'rental_number',
  })
  rentalNumber: string;

  @Column({ name: 'device_id' })
  deviceId: number;

  @ManyToOne(() => KioskDevice, (device) => device.rentals)
  @JoinColumn({ name: 'device_id' })
  device: KioskDevice;

  @Column({ name: 'kiosk_id' })
  kioskId: number;

  @ManyToOne(() => Kiosk, (kiosk) => kiosk.rentals)
  @JoinColumn({ name: 'kiosk_id' })
  kiosk: Kiosk;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'renter_name',
  })
  renterName: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'renter_phone',
  })
  renterPhone: string;

  @Column({
    type: 'datetime',
    name: 'rental_datetime',
  })
  rentalDatetime: Date;

  @Column({
    type: 'datetime',
    name: 'expected_return_datetime',
  })
  expectedReturnDatetime: Date;

  @Column({
    type: 'datetime',
    name: 'actual_return_datetime',
    nullable: true,
  })
  actualReturnDatetime: Date;

  @Column({
    type: 'enum',
    enum: KioskRentalStatus,
    default: KioskRentalStatus.RENTED,
  })
  status: KioskRentalStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
