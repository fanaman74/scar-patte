import {sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const requests=sqliteTable('appointment_requests',{
 id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),petName:text('pet_name').notNull(),pet:text('pet').notNull(),service:text('service').notNull(),date:text('preferred_date').notNull(),time:text('preferred_time').notNull(),message:text('message').notNull().default(''),language:text('language').notNull(),status:text('status').notNull().default('new'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
},t=>[index('requests_created').on(t.createdAt),index('requests_status').on(t.status)]);
