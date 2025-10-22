import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Facility } from './facility.entity';
import { FacilityRentalDevice } from './facility-rental-device.entity';

@Entity('facility_rentals')
export class FacilityRental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facility_id' })
  facilityId: number;

  @Column({ name: 'rental_date', type: 'date' })
  rentalDate: string;

  @Column({ name: 'rental_weekday', length: 10 })
  rentalWeekday: string;

  @Column({
    name: 'rental_type',
    type: 'enum',
    enum: ['개인', '단체'],
  })
  rentalType: string;

  @Column({ name: 'borrower_name', length: 100 })
  borrowerName: string;

  @Column({ name: 'borrower_phone', length: 20 })
  borrowerPhone: string;

  @Column({ name: 'organization_name', length: 200, nullable: true })
  organizationName: string;

  @Column({
    type: 'enum',
    enum: ['남성', '여성', '기타'],
  })
  gender: string;

  @Column({ length: 100 })
  region: string;

  @Column({ length: 200 })
  residence: string;

  @Column({
    name: 'age_group',
    type: 'enum',
    enum: ['10대', '20대', '30대', '40대', '50대', '60대', '70대이상'],
  })
  ageGroup: string;

  @Column({ name: 'rental_purpose', length: 500, nullable: true })
  rentalPurpose: string;

  @Column({ name: 'disability_type', length: 200, nullable: true })
  disabilityType: string;

  @Column({ name: 'return_date', type: 'date' })
  returnDate: string;

  @Column({
    name: 'rental_period',
    type: 'int',
    generatedType: 'STORED',
    asExpression: 'DATEDIFF(return_date, rental_date) + 1',
  })
  rentalPeriod: number;

  @Column({ name: 'expected_users', nullable: true })
  expectedUsers: number;

  @Column({ name: 'actual_return_date', type: 'datetime', nullable: true })
  actualReturnDate: Date;

  @Column({
    type: 'enum',
    enum: ['대여중', '반납완료', '연체'],
    default: '대여중',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy: string;

  @ManyToOne(() => Facility, (facility) => facility.facilityRentals)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @OneToMany(() => FacilityRentalDevice, (rentalDevice) => rentalDevice.rental)
  rentalDevices: FacilityRentalDevice[];
}
