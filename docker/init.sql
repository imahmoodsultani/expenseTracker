-- Grant privileges needed for Prisma's shadow database (used during `prisma migrate dev`)
GRANT ALL PRIVILEGES ON *.* TO 'expense_user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
