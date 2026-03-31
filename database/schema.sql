CREATE DATABASE IF NOT EXISTS school_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_dashboard;

CREATE TABLE IF NOT EXISTS app_settings (
  id TINYINT PRIMARY KEY,
  admin_name VARCHAR(100) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  school_address VARCHAR(255) NOT NULL,
  school_contact VARCHAR(100) NOT NULL,
  theme VARCHAR(50) NOT NULL,
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_accounts (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'teacher') NOT NULL,
  linked_id VARCHAR(36) NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATETIME NOT NULL,
  gender VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL UNIQUE,
  contact_phone VARCHAR(50) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  enrollment_date DATETIME NOT NULL,
  grade_level VARCHAR(100) NOT NULL,
  parent_ids JSON NULL
);

CREATE TABLE IF NOT EXISTS teachers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATETIME NOT NULL,
  gender VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL UNIQUE,
  contact_phone VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  hire_date DATETIME NOT NULL,
  department VARCHAR(100) NOT NULL,
  qualification VARCHAR(255) NOT NULL,
  classes JSON NULL
);

CREATE TABLE IF NOT EXISTS student_fees (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  fee_type_id VARCHAR(100) NOT NULL,
  amount_due DECIMAL(10, 2) NOT NULL,
  due_date DATETIME NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  status ENUM('paid', 'due', 'overdue') NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  class_session_id VARCHAR(100) NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  recorded_by_teacher_name VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_results (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  exam_id VARCHAR(100) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  score DECIMAL(10, 2) NOT NULL,
  max_score DECIMAL(10, 2) NOT NULL,
  result_date DATETIME NOT NULL,
  comments TEXT NULL,
  graded_by_teacher_name VARCHAR(36) NOT NULL,
  parent_user_ids JSON NULL
);

INSERT INTO app_settings (id, admin_name, admin_email, school_name, school_address, school_contact, theme, dark_mode)
VALUES (1, 'Geda Abay', 'gedaabay@gmail.com', 'Adama City Education Bureau', 'Adama, Ethiopia', '+251 912 345 678', '259 71% 50%', false)
ON DUPLICATE KEY UPDATE id = id;
