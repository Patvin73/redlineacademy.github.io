# Manual Testing Checklist - Redline Academy Dashboards

**Date Created:** May 3, 2026  
**Tester Name:** ________________  
**Date Tested:** ________________  
**Environment:** Local / Staging / Production  

---

## ✅ GLOBAL TESTING (Semua Dashboards)

### Authentication & Authorization
- [ ] Login page berfungsi dengan kredensial yang valid
- [ ] Login ditolak dengan kredensial yang salah
- [ ] Redirect ke login jika belum authenticated (buka dashboard langsung di URL)
- [ ] User tidak bisa akses dashboard dengan role yang tidak sesuai
  - [ ] Student tidak bisa akses dashboard admin/marketer
  - [ ] Admin tidak bisa akses dashboard student/marketer
  - [ ] Marketer tidak bisa akses dashboard admin/student
- [ ] Logout button berfungsi dan redirect ke home
- [ ] Session persists setelah page refresh (localStorage/cookie)
- [ ] Session expired handling (jika ada timeout)

### Language Switching
- [ ] Language switcher terlihat di header (untuk marketer) atau sidebar (untuk admin/student)
- [ ] Click bahasa Indonesia → semua text berubah ke bahasa Indonesia
- [ ] Click bahasa English → semua text berubah ke bahasa English
- [ ] Language preference disimpan di localStorage
- [ ] Language selection persists setelah page refresh
- [ ] Translate keys yang hilang ditampilkan dengan fallback (tidak blank)

### Responsive Design
- [ ] Desktop (1920px+): Layout normal, semua elemen terlihat
- [ ] Tablet (768px-1024px): Responsive, navigasi berfungsi
- [ ] Mobile (375px-480px): 
  - [ ] Sidebar/nav collapse menjadi hamburger menu
  - [ ] Hamburger menu berfungsi (open/close)
  - [ ] Konten readable tanpa horizontal scroll
  - [ ] Buttons/forms mudah diklik (touch-friendly)
- [ ] No layout shifts atau broken styling saat resize window

### General UI/UX
- [ ] Header/Navbar sticky dan selalu terlihat
- [ ] Footer information (jika ada) terlihat dengan benar
- [ ] No console errors di browser DevTools
- [ ] Loading states menunjukkan spinner/skeleton (jika applicable)
- [ ] Error messages jelas dan informatif
- [ ] Success messages muncul setelah aksi berhasil
- [ ] Modal/dialog berfungsi (open/close, escape key)

---

## 📚 STUDENT DASHBOARD

**Role:** Student  
**Access URL:** `/pages/dashboard-student.html`

### Navigation & Menu
- [ ] Sidebar menampilkan nama dan role student dengan benar
- [ ] Avatar/profile picture muncul
- [ ] Semua menu items terlihat: Home, Courses, Assignments, Schedule, Certificates, Messages, Resources, Profile
- [ ] Menu items responsive pada mobile (hamburger menu)
- [ ] Active menu item highlighted dengan benar
- [ ] Click menu item mengubah section yang ditampilkan

### Section: HOME (Dashboard)
- [ ] Page load menampilkan welcome banner
- [ ] KPI cards terlihat: courses enrolled, assignments pending, grades, certificates
- [ ] KPI cards menampilkan data yang benar (jika ada dummy data)
- [ ] Quick stats row terlihat dengan baik
- [ ] Course in progress section terlihat
- [ ] Assignment due soon section terlihat
- [ ] Recent activity feed terlihat dan update
- [ ] CTA buttons berfungsi (e.g., "Go to Courses", "View Assignment")

### Section: COURSES
- [ ] Course list menampilkan semua courses yang enrolled
- [ ] Setiap course card menunjukkan:
  - [ ] Course title
  - [ ] Thumbnail/image
  - [ ] Progress bar (jika applicable)
  - [ ] Status (In Progress, Completed, etc.)
  - [ ] Instructor name
- [ ] Click course card membuka course detail atau redirect ke course page
- [ ] Search/filter courses berfungsi (jika ada)
- [ ] Sort by name, progress, status berfungsi (jika ada)

### Section: ASSIGNMENTS
- [ ] Assignment list menampilkan semua assignments
- [ ] Setiap assignment menunjukkan:
  - [ ] Assignment title
  - [ ] Course name
  - [ ] Due date
  - [ ] Status (Submitted, Pending, Graded, etc.)
  - [ ] Grade (jika sudah graded)
- [ ] Filter by status berfungsi (All, Pending, Submitted, Graded)
- [ ] Sort by due date berfungsi
- [ ] Click assignment membuka detail atau submission form
- [ ] Submit assignment button berfungsi (file upload/form submission)

### Section: SCHEDULE
- [ ] Calendar atau event list terlihat
- [ ] Events menampilkan:
  - [ ] Event title
  - [ ] Date & time
  - [ ] Location/room (jika applicable)
  - [ ] Instructor name
- [ ] Click event menampilkan detail lengkap
- [ ] Add to calendar button berfungsi (jika ada)
- [ ] Email reminders setting terlihat (jika ada)

### Section: CERTIFICATES
- [ ] Certificate list menampilkan sertifikat yang sudah diterima
- [ ] Setiap certificate menunjukkan:
  - [ ] Certificate name/course
  - [ ] Date issued
  - [ ] Verification link/QR code (jika applicable)
- [ ] Download certificate button berfungsi
- [ ] Share certificate button berfungsi (jika ada)
- [ ] Empty state terlihat dengan benar jika belum ada certificate

### Section: MESSAGES
- [ ] Message inbox menampilkan list conversations
- [ ] Setiap conversation menampilkan:
  - [ ] Sender/participant name
  - [ ] Last message preview
  - [ ] Timestamp
  - [ ] Unread indicator (jika ada)
- [ ] Click conversation membuka chat thread
- [ ] Send message form berfungsi
- [ ] File/attachment upload berfungsi (jika supported)
- [ ] Mark as read/unread berfungsi
- [ ] Archive/delete conversation berfungsi (jika ada)

### Section: RESOURCES
- [ ] Resource list menampilkan semua available resources
- [ ] Setiap resource menunjukkan:
  - [ ] Resource title
  - [ ] Type (document, video, link, etc.)
  - [ ] Course/module associated
  - [ ] Upload date
- [ ] Filter by type berfungsi
- [ ] Download resource berfungsi
- [ ] View resource berfungsi (preview jika applicable)
- [ ] Search resources berfungsi

### Section: PROFILE
- [ ] Profile information menampilkan:
  - [ ] Student name
  - [ ] Email
  - [ ] Phone (jika applicable)
  - [ ] Bio/about
  - [ ] Profile picture
  - [ ] Join date
- [ ] Edit profile form berfungsi
  - [ ] Update name berhasil
  - [ ] Update email berhasil
  - [ ] Upload profile picture berhasil
  - [ ] Update password berhasil
- [ ] Settings tab (jika ada):
  - [ ] Notification preferences berfungsi
  - [ ] Privacy settings berfungsi
  - [ ] Language preference berfungsi
- [ ] Success message muncul setelah save

---

## 💼 ADMIN DASHBOARD

**Role:** Admin / Trainer  
**Access URL:** `/pages/dashboard-admin.html`

### Navigation & Sidebar
- [ ] Sidebar menampilkan nama dan role (Admin/Trainer) dengan benar
- [ ] Sidebar sticky dan berfungsi
- [ ] Menu items terlihat: Home, Students, Courses, Grading, Schedule, Messages, Reports, Users, Enrollments, Announcements, Settings, Create Article
- [ ] Click menu item mengubah section
- [ ] Active menu item highlighted
- [ ] Sidebar collapse di mobile (hamburger menu)
- [ ] Close sidebar button bekerja (mobile)

### Section: HOME (Dashboard)
- [ ] Welcome banner menampilkan nama admin
- [ ] KPI Grid cards menampilkan:
  - [ ] Total students
  - [ ] Active courses
  - [ ] Pending assignments
  - [ ] Messages unread
  - [ ] Enrollment revenue (jika applicable)
- [ ] Recent activity feed terlihat dan real-time update
- [ ] Pending actions list terlihat
- [ ] Students at-risk table terlihat:
  - [ ] Student name
  - [ ] Current grade/progress
  - [ ] Last activity
  - [ ] Action buttons (contact, view profile)

### Section: MY STUDENTS
- [ ] Student list menampilkan semua students
- [ ] Setiap student row menunjukkan:
  - [ ] Student name
  - [ ] Email
  - [ ] Enrollment date
  - [ ] Current course
  - [ ] Progress/grade
  - [ ] Status (Active, Inactive, etc.)
- [ ] Filter by course berfungsi
- [ ] Filter by status berfungsi
- [ ] Search student berfungsi
- [ ] Sort by name, grade, enrollment date berfungsi
- [ ] Click student membuka detail profile
- [ ] Action buttons: view profile, send message, view grades (berfungsi)

### Section: COURSE MANAGEMENT
- [ ] Course list menampilkan semua courses
- [ ] Setiap course card menunjukkan:
  - [ ] Course title
  - [ ] Thumbnail
  - [ ] Instructor name
  - [ ] Enrollment count
  - [ ] Status (Published, Draft, Archived)
- [ ] Create course button berfungsi → membuka form
- [ ] Course form fields:
  - [ ] Course title input
  - [ ] Description textarea
  - [ ] Category dropdown
  - [ ] Thumbnail upload
  - [ ] Price input (jika applicable)
  - [ ] Save course berhasil
- [ ] Edit course button berfungsi
- [ ] Delete course button berfungsi (dengan confirmation)
- [ ] Publish/unpublish course berfungsi
- [ ] View course analytics berfungsi

### Section: ASSIGNMENTS & GRADING
- [ ] Assignment list menampilkan semua assignments
- [ ] Setiap assignment menunjukkan:
  - [ ] Assignment title
  - [ ] Course
  - [ ] Due date
  - [ ] Submission count / total students
  - [ ] Status
- [ ] Click assignment membuka grading view
- [ ] Grading interface menampilkan:
  - [ ] Student submissions list
  - [ ] Submission preview
  - [ ] Grade input field
  - [ ] Feedback textarea
- [ ] Submit grade berhasil
- [ ] Bulk grade/feedback (jika ada) berfungsi
- [ ] Filter by submission status berfungsi
- [ ] Download submissions berfungsi (jika ada)

### Section: SCHEDULE
- [ ] Calendar view menampilkan events
- [ ] Setiap event menunjukkan title, date, time
- [ ] Create event button berfungsi → membuka form
- [ ] Event form fields:
  - [ ] Event title
  - [ ] Date/time picker
  - [ ] Location/room
  - [ ] Description
  - [ ] Participant selection (students/courses)
  - [ ] Send notification checkbox
- [ ] Save event berhasil
- [ ] Edit event berfungsi
- [ ] Delete event berfungsi
- [ ] View event detail berfungsi
- [ ] Attendee list terlihat (jika applicable)

### Section: MESSAGES
- [ ] Message inbox menampilkan conversations
- [ ] Send message button berfungsi → form/modal
- [ ] Compose message form:
  - [ ] Recipient selection (student/group)
  - [ ] Subject field
  - [ ] Message body
  - [ ] Attachment upload (jika supported)
  - [ ] Send button
- [ ] View conversation thread berfungsi
- [ ] Reply to message berfungsi
- [ ] Archive/delete conversation berfungsi
- [ ] Search messages berfungsi

### Section: REPORTS & ANALYTICS
- [ ] Metrics grid menampilkan:
  - [ ] Total enrollment
  - [ ] Average grade
  - [ ] Course completion rate
  - [ ] Student retention
- [ ] Course overview table menampilkan:
  - [ ] Course name
  - [ ] Enrollment count
  - [ ] Completion rate
  - [ ] Average grade
  - [ ] Revenue (jika applicable)
- [ ] Download report button berfungsi (CSV/PDF)
- [ ] Chart/graph display berfungsi (jika ada)
- [ ] Date range filter berfungsi

### Section: USER MANAGEMENT (Admin-only)
- [ ] User list menampilkan semua users (students, trainers, admins)
- [ ] Setiap user menunjukkan:
  - [ ] Name
  - [ ] Email
  - [ ] Role
  - [ ] Status (Active, Inactive)
  - [ ] Join date
- [ ] Add user button berfungsi → modal/form
- [ ] Add user form fields:
  - [ ] Name input
  - [ ] Email input
  - [ ] Password input (atau generate)
  - [ ] Role dropdown
  - [ ] Submit button
- [ ] Edit user berfungsi
- [ ] Delete user berfungsi (dengan confirmation)
- [ ] Activate/deactivate user berfungsi
- [ ] Reset password button berfungsi
- [ ] Search/filter user berfungsi

### Section: ENROLLMENTS & PAYMENTS (Admin-only)
- [ ] Enrollment list menampilkan semua enrollments
- [ ] Setiap enrollment menunjukkan:
  - [ ] Student name
  - [ ] Course
  - [ ] Enrollment date
  - [ ] Payment status (Paid, Pending, Overdue)
  - [ ] Amount
- [ ] Payment summary cards menampilkan:
  - [ ] Total revenue
  - [ ] Pending payments
  - [ ] Paid this month
- [ ] Record payment button berfungsi → modal/form
- [ ] Payment form fields:
  - [ ] Student selection
  - [ ] Course selection
  - [ ] Amount input
  - [ ] Payment method dropdown
  - [ ] Payment date picker
  - [ ] Installment option (jika applicable)
  - [ ] Submit button
- [ ] Record payment berhasil → update status
- [ ] Download payment report berfungsi
- [ ] Filter by status berfungsi

### Section: ANNOUNCEMENTS (Admin-only)
- [ ] Announcement list menampilkan semua announcements
- [ ] Setiap announcement menunjukkan:
  - [ ] Title
  - [ ] Content preview
  - [ ] Date posted
  - [ ] Target audience (all, specific course, etc.)
- [ ] Create announcement button berfungsi → form
- [ ] Announcement form fields:
  - [ ] Title input
  - [ ] Content editor (rich text)
  - [ ] Audience selector
  - [ ] Publish immediately checkbox
  - [ ] Schedule date/time (jika scheduled)
  - [ ] Submit button
- [ ] Create announcement berhasil
- [ ] Edit announcement berfungsi
- [ ] Delete announcement berfungsi
- [ ] Publish/unpublish berfungsi
- [ ] View who received announcement (jika tracked)

### Section: SYSTEM SETTINGS (Admin-only)
- [ ] Settings form menampilkan:
  - [ ] Site name field
  - [ ] Site URL field
  - [ ] Contact email field
  - [ ] Support phone field
  - [ ] Timezone dropdown
  - [ ] Currency dropdown
  - [ ] Language options
- [ ] Email settings tab (jika ada):
  - [ ] SMTP server
  - [ ] Email templates
  - [ ] Notification frequency
- [ ] Payment settings tab (jika ada):
  - [ ] Payment gateway selection
  - [ ] API keys
  - [ ] Commission structure (untuk marketer)
- [ ] Security settings tab (jika ada):
  - [ ] 2FA enablement
  - [ ] Password policy
  - [ ] Session timeout
- [ ] Save settings berhasil → confirmation message
- [ ] Reset to default button berfungsi (dengan confirmation)

### Section: CREATE ARTICLE (Admin-only)
- [ ] Article editor page load dengan baik
- [ ] Form fields:
  - [ ] Title input
  - [ ] Content editor (rich text)
  - [ ] Featured image upload
  - [ ] Category selection
  - [ ] Tags input
  - [ ] Meta description
  - [ ] Publish button
- [ ] Create article berhasil
- [ ] Article terlihat di blog page setelah publish
- [ ] Edit article berfungsi
- [ ] Delete article berfungsi
- [ ] Preview article berfungsi

### Additional Admin Features
- [ ] Top bar search functionality berfungsi
- [ ] Notification panel menampilkan recent activities
- [ ] Mark all as read berfungsi
- [ ] Quick actions/shortcuts (jika ada)

---

## 📊 MARKETER DASHBOARD

**Role:** Marketer  
**Access URL:** `/pages/dashboard-marketer.html`

### Header & Navigation
- [ ] Header sticky dan menampilkan brand/logo
- [ ] Marketer name dan role terlihat di header
- [ ] Navigation tabs terlihat: Overview, Schools, Claim, Reports, Guide
- [ ] Click tab mengubah panel
- [ ] Active tab highlighted
- [ ] Logout button visible dan berfungsi
- [ ] Language switcher visible dan berfungsi

### Tab: OVERVIEW
- [ ] Dashboard header terlihat dengan eyebrow dan title
- [ ] Stats row menampilkan 4 cards:
  - [ ] Total Komisi (currency format: Rp 0)
  - [ ] Menunggu Pencairan (Rp 0)
  - [ ] Siswa Terdaftar (number)
  - [ ] Sekolah Aktif (number)
- [ ] Card styling berbeda per card (accent, amber, green, blue)
- [ ] Recent activity section terlihat:
  - [ ] Table dengan: Activity, Date, Status
  - [ ] Data terlihat (dummy atau real)
  - [ ] Timestamp format benar
- [ ] Commission structure section:
  - [ ] Table menampilkan komisi levels
  - [ ] Access Fee dan registration commission
  - [ ] Percentage/amount jelas terlihat
- [ ] Icon & badge terlihat di card headers

### Tab: SCHOOLS
- [ ] Section header terlihat dengan "Manajemen" eyebrow
- [ ] "+ Tambah Sekolah" button terlihat
- [ ] Click "Tambah Sekolah" → form muncul/panel open
- [ ] Add School form menampilkan fields:
  - [ ] School name input
  - [ ] District/City dropdown
  - [ ] Contact person name
  - [ ] Contact phone
  - [ ] Contact email
  - [ ] Save & Cancel buttons
- [ ] Add school berhasil → list update
- [ ] Schools list/table menampilkan:
  - [ ] School name
  - [ ] Location/city
  - [ ] Contact person
  - [ ] Phone number
  - [ ] Email
  - [ ] Edit button
  - [ ] Delete button
- [ ] Edit school berfungsi
- [ ] Delete school berfungsi (dengan confirmation)
- [ ] Search school berfungsi (jika ada)
- [ ] School count badge update

### Tab: CLAIM (Submit Claim)
- [ ] Info alert terlihat dengan info icon
- [ ] Alert message jelas menjelaskan claim process
- [ ] Claim form card menampilkan:
  - [ ] Reference ID tag (ID: -)
- [ ] Form fields:
  - [ ] Select school dropdown (populated dari schools list)
  - [ ] Presentation date picker
  - [ ] Number of students registered input
  - [ ] Access fee calculation (auto-calculated)
  - [ ] Registration commission calculation (auto-calculated)
  - [ ] Total komisi summary
  - [ ] Submit button
- [ ] Form validation:
  - [ ] School required → error jika kosong
  - [ ] Date required → error jika kosong
  - [ ] Student number required → error jika kosong
- [ ] Submit claim berhasil → success message
- [ ] Calculation: Access Fee formula benar
- [ ] Calculation: Commission formula benar
- [ ] Reference ID di-generate setelah submit (atau pre-generated)

### Tab: REPORTS
- [ ] Section header terlihat dengan "Riwayat" eyebrow
- [ ] Reports list/table menampilkan:
  - [ ] Claim reference ID
  - [ ] School name
  - [ ] Presentation date
  - [ ] Students registered
  - [ ] Total komisi (Rp format)
  - [ ] Status (Submitted, In Review, Approved, Paid, Rejected)
  - [ ] View button (lihat detail)
- [ ] Status badge styling:
  - [ ] Different color for different status
  - [ ] Text clear dan readable
- [ ] Click "View" button → detail panel muncul
- [ ] Detail panel menampilkan:
  - [ ] Claim ID
  - [ ] School name
  - [ ] Presentation date
  - [ ] Attending students
  - [ ] Registered students
  - [ ] Access fee (Rp)
  - [ ] Commission per student (Rp)
  - [ ] Total commission (Rp)
  - [ ] Status & timeline
  - [ ] Admin notes (jika ada)
  - [ ] Back to list button
- [ ] Report count badge update
- [ ] Empty state terlihat jika belum ada claims

### Tab: GUIDE
- [ ] Guide header menampilkan title dan scenario strip
- [ ] Scenario strip menampilkan:
  - [ ] Sample calculation chips
  - [ ] Access fee example
  - [ ] Commission rate example
  - [ ] Expected earning example
- [ ] Guide layout 2-column:
  - [ ] Left: navigation sidebar dengan step numbers
  - [ ] Right: step content area
- [ ] Navigation items terlihat:
  - [ ] Step 1, 2, 3, 4, 5 (numbered)
  - [ ] Step description visible
- [ ] Click step → content area update
- [ ] Each step card menampilkan:
  - [ ] Step badge (numbered, colored)
  - [ ] Step title
  - [ ] Step description
  - [ ] Step chips/tags
- [ ] Calculation example terlihat di guide (mini-calc)
- [ ] FAQ section terlihat (jika ada):
  - [ ] Questions listed
  - [ ] Click Q → A muncul/expand
- [ ] Mobile: Guide responsive (1 column)
- [ ] All text content terlihat dengan jelas
- [ ] Styling konsisten dengan design system

### General Marketer Dashboard
- [ ] No scrolling issues
- [ ] Cards well-spaced
- [ ] Color scheme konsisten
- [ ] Typography hierarchy clear
- [ ] Buttons hover state visible
- [ ] Forms validation message clear
- [ ] Currency format consistent (Rp XXX,XXX)
- [ ] Date format consistent (DD/MM/YYYY atau similar)
- [ ] Loading state visible (jika applicable)

---

## 🔐 SECURITY & DATA INTEGRITY

### All Dashboards
- [ ] CSRF protection: form submission berhasil (tidak ada CSRF error)
- [ ] SQL Injection: special characters di form tidak cause error
- [ ] XSS: malicious script dalam input tidak execute
- [ ] Data tidak leak ke console (check DevTools)
- [ ] API calls secure (HTTPS, not HTTP)
- [ ] Sensitive data (password, email) tidak terekspos di URL
- [ ] Rate limiting tidak hit (jika ada)

### Role-Based Access Control
- [ ] Student account tidak bisa akses admin URL
- [ ] Marketer account tidak bisa akses student URL
- [ ] Admin account tidak bisa downgrade own role
- [ ] Edit request dengan wrong role ID ditolak (API level)

---

## 📱 BROWSER COMPATIBILITY

Test pada browsers berikut:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Per browser:
- [ ] No console errors
- [ ] Styling correct (fonts, colors, spacing)
- [ ] Interactions responsive (click, hover, scroll)
- [ ] Forms work correctly
- [ ] File uploads work correctly

---

## 🚀 PERFORMANCE

### All Dashboards
- [ ] Page load time < 3 seconds (on 4G)
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] No janky animations/scrolling
- [ ] Images loaded correctly (not 404)
- [ ] Fonts loaded correctly (not blocky/jumpy)
- [ ] Large tables pagination/virtualization working (jika applicable)

---

## 🔄 DATA FLOW & INTEGRATION

### API & Supabase Integration
- [ ] Data dari Supabase load dengan benar
- [ ] Real-time updates berfungsi (jika applicable)
- [ ] Error handling: 500 error show user-friendly message
- [ ] Error handling: 404 data show "No data" message
- [ ] Empty state properly designed (not just blank)

### localStorage & Session Storage
- [ ] Language selection persist
- [ ] User session persist (tidak logout pada refresh)
- [ ] Preference settings persist

---

## ✍️ NOTES & ISSUES FOUND

| Test Case | Status | Notes | Screenshot |
|-----------|--------|-------|------------|
| | PASS / FAIL | | |
| | PASS / FAIL | | |
| | PASS / FAIL | | |

---

## 🎯 SIGN-OFF

| Item | Value |
|------|-------|
| **Tester Name** | |
| **Date Tested** | |
| **Total Test Cases** | |
| **Passed** | |
| **Failed** | |
| **Blocked** | |
| **Pass Rate %** | |
| **Overall Status** | ✅ PASS / ⚠️ FAIL WITH ISSUES / ❌ FAIL |
| **Remarks** | |

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Next Review:** [TBD]
