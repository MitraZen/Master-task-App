# Master Task Tracker

A clean, minimal web-based task tracker built with Next.js 15 and Supabase, inspired by Excel spreadsheet functionality.

## Features

- **Task Management**: Create, edit, delete, and track tasks
- **Visual Design**: Excel-like table layout with color-coded priorities
- **Progress Tracking**: Visual progress bars and completion percentages
- **Filtering & Sorting**: Filter by priority, status, frequency, and search
- **Auto Status Handling**: Automatically marks tasks as overdue
- **Configurable Fields**: Add custom fields through the database
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Components**: Shadcn/UI, Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd master-task-app
   npm install
   ```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

3. **Set up the database**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the contents of `supabase-schema.sql` to create the required tables

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) - you'll be redirected to `/tasks`

## Database Schema

### Tasks Table
- `id`: UUID primary key
- `task_name`: Task description
- `frequency`: Daily/Weekly/Monthly/Yearly/Adhoc
- `priority`: High/Medium/Low (color-coded)
- `start_date`: Task start date
- `due_date`: Task due date
- `est_hours`: Estimated hours
- `status`: Not Started/In Progress/Complete/Overdue
- `percent_complete`: Completion percentage (0-100)
- `done`: Boolean completion status
- `notes`: Optional notes
- `created_at`/`updated_at`: Timestamps

### Task Fields Config Table
- `id`: UUID primary key
- `field_name`: Custom field name
- `field_type`: text/number/date/boolean/select
- `visible`: Whether to display in UI
- `options`: JSON array for select fields

## Features Overview

### Task Management
- **Add Tasks**: Click "Add Task" to create new tasks
- **Edit Tasks**: Click the edit icon to modify existing tasks
- **Delete Tasks**: Click the trash icon to remove tasks
- **Mark Complete**: Click the circle icon to toggle completion

### Visual Elements
- **Priority Colors**: 
  - High: Red background
  - Medium: Yellow background  
  - Low: Green background
- **Progress Bars**: Visual completion percentage
- **Status Badges**: Color-coded status indicators
- **Checkmarks**: Green checkmark for completed tasks

### Filtering & Search
- **Search**: Find tasks by name or notes
- **Priority Filter**: Filter by High/Medium/Low
- **Status Filter**: Filter by task status
- **Frequency Filter**: Filter by task frequency
- **Clear Filters**: Reset all filters

### Auto Features
- **Overdue Detection**: Tasks past due date automatically marked as "Overdue"
- **Completion Logic**: Marking as "Done" sets progress to 100% and status to "Complete"
- **Real-time Updates**: Changes reflect immediately in the UI

## API Endpoints

- `GET /api/tasks` - Fetch all tasks (with optional filtering)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks` - Update an existing task
- `DELETE /api/tasks/[id]` - Delete a task
- `GET /api/task-fields` - Get field configuration
- `POST /api/task-fields` - Create custom field
- `PUT /api/task-fields` - Update field configuration

## Customization

### Adding Custom Fields
1. Insert a new row in the `task_fields_config` table:
   ```sql
   INSERT INTO task_fields_config (field_name, field_type, visible) 
   VALUES ('assigned_to', 'text', true);
   ```

2. Add the field to your task creation/editing forms
3. Update the API endpoints to handle the new field

### Styling
- Modify `tailwind.config.ts` for custom colors/themes
- Update component styles in the `/src/components` directory
- Customize the table layout in `task-table.tsx`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- Ensure your platform supports Next.js 15
- Set up your environment variables
- Run `npm run build` to create production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.