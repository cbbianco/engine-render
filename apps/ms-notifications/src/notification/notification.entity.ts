import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  type: string; // 'error', 'info', 'confirm', 'success', etc.

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  author: string; // userName of the person who generated the notification

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  targetUserId: string; // Optional: If the notification is for a specific user

  @Column({ type: 'json', nullable: true })
  metadata: any; // Flexible data for future actions

  @CreateDateColumn()
  createdAt: Date;
}
