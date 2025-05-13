import {
  pgTable,
  uuid,
  text,
  varchar,
  date,
  boolean,
  timestamp,
  json
} from 'drizzle-orm/pg-core';

// 광고주 테이블 (clients)
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contractStart: date('contract_start').notNull(),
  contractEnd: date('contract_end').notNull(),
  statusTags: json('status_tags').$type<string[]>().default([]),
  icon: text('icon').default('🏢'),
  usesCoupon: boolean('uses_coupon').default(false),
  publishesNews: boolean('publishes_news').default(false),
  usesReservation: boolean('uses_reservation').default(false),
  phoneNumber: varchar('phone_number', { length: 20 }),
  naverPlaceUrl: text('naver_place_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 광고주 할 일 테이블 (client_todos)
export const clientTodos = pgTable('client_todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  assignedTo: varchar('assigned_to', { length: 255 }),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: varchar('completed_by', { length: 255 }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

// 광고주 메모 테이블 (client_notes)
export const clientNotes = pgTable('client_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  note: text('note').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
