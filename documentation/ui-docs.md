🎨 StudyBuddy UI/UX Guidelines
1️⃣ Color Palette (Purple Theme)
Purpose	Color	HEX
Primary	Deep Purple	#6B46C1
Secondary	Light Purple	#9F7AEA
Accent	Lavender	#D6BCFA
Background	Off White	#F9FAFB
Card / Surface	White	#FFFFFF
Text Primary	Dark Gray	#1A202C
Text Secondary	Gray	#718096
Error	Red	#E53E3E
Success	Green	#38A169

💡 Tip: Use primary for buttons, headers, and active elements. Use accent for highlights and hover effects.

2️⃣ Typography
Element	Font Family	Font Weight	Size
Heading 1 (H1)	Inter	700	32px
Heading 2 (H2)	Inter	600	24px
Heading 3 (H3)	Inter	500	20px
Body	Inter	400	16px
Small / Caption	Inter	400	14px

Line Heights:

H1: 40px

H2: 32px

H3: 28px

Body: 24px

Small: 20px

Notes: Keep text left-aligned and consistent spacing.

3️⃣ Spacing & Layout
Space	Pixels
XS	4px
S	8px
M	16px
L	24px
XL	32px
XXL	48px

Grid System

12-column responsive layout

Gutter: 16px

Max width: 1200px

Mobile-first (≤768px: 1-2 columns)

4️⃣ Components
4.1 Buttons

Primary Button: Purple background (#6B46C1), White text, rounded-md, hover (#9F7AEA)

Secondary Button: White background, Purple border, Purple text, hover: fill primary

Sizes: Small, Medium, Large

.btn-primary {
  background-color: #6B46C1;
  color: #FFFFFF;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
}
.btn-primary:hover {
  background-color: #9F7AEA;
}

4.2 Inputs

Rounded-md, subtle shadow

Focus: outline purple

Placeholder: #718096

Error: border-red-500

.input {
  border: 1px solid #E2E8F0;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}
.input:focus {
  border-color: #6B46C1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.2);
}

4.3 Cards

White background, rounded-lg, shadow-md

Padding: 16px

Margin-bottom: 16px

.card {
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

4.4 Navigation Bar

Horizontal top nav

Background: #6B46C1

Logo left, links right

Active link: lighter purple

Mobile: Hamburger menu

4.5 Chat Box

Message bubble rounded, max-width 70%

Sender: Primary purple bubble, white text

Receiver: Gray bubble, dark text

Timestamp below bubble in small font

4.6 Calendar / Schedule

Card-style event display

Event color: primary purple

Hover: accent color (#D6BCFA)

Popup for details

4.7 File Upload

Drag & drop area with dashed border, rounded

Upload icon + "Drag files or click to upload"

Hover: border purple

Preview list below

5️⃣ Example Screens
5.1 Login / Signup

Card centered

Input fields stacked

Primary button purple

Minimal background, subtle gradient or abstract shapes

5.2 Dashboard

Sidebar with groups

Main area: recent notes, upcoming sessions

Cards for groups / notes

5.3 Group Page

Top: Group name + join info

Tabs: Chat | Notes | Schedule

Notes: list of uploaded files

Chat: scrollable bubble layout

Schedule: mini calendar

5.4 Create Study Session

Modal or card

Inputs: title, date, time, link/location

Primary button: create

5.5 File Upload

Drag & drop box

Uploaded files list with icon and filename

Delete/edit options

6️⃣ Interactions & Animations

Buttons: smooth hover transition (0.2s)

Modals: fade-in 0.3s

Cards: subtle shadow on hover

Chat: scroll auto-scroll, fade-in new message

7️⃣ Accessibility

Contrast ratio ≥ 4.5:1 for text

Focus ring for inputs & buttons

Keyboard navigation for chat & schedule