-- Convert legacy member accounts before removing the enum value.
UPDATE users SET role = 'user' WHERE role = 'member';
ALTER TABLE users MODIFY role ENUM('admin','operator','user') NOT NULL DEFAULT 'user';
