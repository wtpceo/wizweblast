import { pgTable, serial, text, timestamp, boolean, json, integer, date, uuid, pgEnum, foreignKey, numeric, varchar } from 'drizzle-orm/pg-core';

// 사용자 역할 enum 정의
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'member']);

// 결제 상태 enum 정의
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// 사용자 테이블
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  profileImage: text('profile_image'),
  role: userRoleEnum('role').default('member'),
  teamId: uuid('team_id').references(() => teams.id),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 팀 테이블
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  plan: text('plan').default('free'),
  ownerId: uuid('owner_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 팀 초대 테이블
export const teamInvitations = pgTable('team_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  email: text('email').notNull(),
  role: userRoleEnum('role').default('member'),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 광고주 테이블
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  name: text('name').notNull(),
  icon: text('icon').default('🏢'),
  contractStart: date('contract_start').notNull(),
  contractEnd: date('contract_end').notNull(),
  statusTags: json('status_tags').$type<string[]>().default(['정상']),
  usesCoupon: boolean('uses_coupon').default(false),
  publishesNews: boolean('publishes_news').default(false),
  usesReservation: boolean('uses_reservation').default(false),
  phoneNumber: text('phone_number'),
  naverPlaceUrl: text('naver_place_url'),
  address: text('address'),
  businessNumber: text('business_number'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  monthlyBudget: integer('monthly_budget'),
  tags: json('tags').$type<string[]>().default([]),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 광고주 메모 테이블
export const clientNotes = pgTable('client_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  pinned: boolean('pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 광고주 할 일 테이블
export const clientTodos = pgTable('client_todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  dueDate: timestamp('due_date'),
  priority: integer('priority').default(0),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  completedBy: uuid('completed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 공지사항 테이블
export const notices = pgTable('notices', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isFixed: boolean('is_fixed').default(false),
  tags: json('tags').$type<string[]>().default([]),
  viewCount: integer('view_count').default(0),
  publishedAt: timestamp('published_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 공지사항 읽음 상태 테이블
export const noticeReads = pgTable('notice_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  noticeId: uuid('notice_id').references(() => notices.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  readAt: timestamp('read_at').defaultNow(),
});

// 통계 테이블
export const statistics = pgTable('statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  date: date('date').notNull(),
  activeClients: integer('active_clients').default(0),
  expiringClients: integer('expiring_clients').default(0),
  totalRevenue: numeric('total_revenue').default('0'),
  completedTodos: integer('completed_todos').default(0),
  pendingTodos: integer('pending_todos').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 팀 활동 로그 테이블
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'), // 'client', 'notice', 'todo' 등
  entityId: text('entity_id'),
  details: json('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 파일 테이블
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // bytes
  path: text('path').notNull(),
  entityType: text('entity_type'), // 'client', 'notice' 등
  entityId: text('entity_id'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 결제 테이블
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('KRW'),
  status: paymentStatusEnum('status').default('pending'),
  paymentMethod: text('payment_method'),
  description: text('description'),
  externalId: text('external_id'), // 외부 결제 시스템 ID
  metadata: json('metadata'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 구독 테이블
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  plan: text('plan').notNull(), // 'free', 'pro', 'enterprise' 등
  status: text('status').notNull(), // 'active', 'canceled', 'past_due' 등
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  externalId: text('external_id'), // 외부 구독 ID
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 