import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { KioskDevice } from '../../entities/kiosk-device.entity';
import { KioskRental } from '../../entities/kiosk-rental.entity';
import { KioskExamination } from './kiosk-examination.entity';

@Entity('kiosks')
export class Kiosk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '키오스크 이름' })
  name: string;

  @Column({ type: 'varchar', length: 200, comment: '설치 장소' })
  location: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '담당자명',
  })
  managerName: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '담당자 연락처',
  })
  managerPhone: string;

  @Column({
    type: 'date',
    nullable: true,
    comment: '설치일',
  })
  installationDate: Date | null;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
    comment: '키오스크 상태',
  })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '비고' })
  notes: string;

  @CreateDateColumn({ type: 'datetime', comment: '생성 일시' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '수정 일시' })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'datetime',
    nullable: true,
    comment: '삭제 일시 (소프트 삭제)',
  })
  deletedAt: Date;

  // Relations
  @OneToMany(() => KioskDevice, (device) => device.kiosk)
  devices: KioskDevice[];

  @OneToMany(() => KioskRental, (rental) => rental.kiosk)
  rentals: KioskRental[];

  @OneToMany(() => KioskExamination, (examination) => examination.kiosk)
  examinations: KioskExamination[];
}
