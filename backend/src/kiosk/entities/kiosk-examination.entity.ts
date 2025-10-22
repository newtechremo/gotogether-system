import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Kiosk } from './kiosk.entity';

@Entity('kiosk_examinations')
export class KioskExamination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '키오스크 ID' })
  kioskId: number;

  @Column({ type: 'date', comment: '점검 일자' })
  examinationDate: Date;

  @Column({
    type: 'enum',
    enum: ['pass', 'fail', 'pending'],
    default: 'pending',
    comment: '점검 결과',
  })
  result: string;

  @Column({
    type: 'enum',
    enum: ['normal', 'warning', 'critical'],
    default: 'normal',
    comment: '점검 상태',
  })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '비고' })
  notes: string;

  @CreateDateColumn({ type: 'datetime', comment: '생성 일시' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '수정 일시' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Kiosk, (kiosk) => kiosk.examinations)
  @JoinColumn({ name: 'kiosk_id' })
  kiosk: Kiosk;
}
