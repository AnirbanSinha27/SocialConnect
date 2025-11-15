# 🌐 Social Connect

A modern, full-stack social networking application built with cutting-edge technologies. Connect with friends, share moments, and engage in real-time conversations—all powered by a secure, scalable architecture.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-blue)](https://tailwindcss.com/)

---

## ✨ Features

### 👥 User Experience

- **🔐 Authentication** - Secure login and registration system
- **📝 Post Creation** - Share text updates with optional image uploads
- **❤️ Engagement** - Like and unlike posts with real-time updates
- **💬 Comments** - Interactive comment system with add/delete capabilities
- **👤 Social Graph** - Follow and unfollow users to curate your feed
- **📰 Personalized Feed** - View posts exclusively from users you follow
- **🔔 Live Notifications** - Get instant updates when:
  - Someone likes your post
  - Someone comments on your post
  - Someone follows you

### 🛡️ Admin Dashboard

- **Role-Based Access Control** - Secure admin-only features
- **User Management** - View and manage all registered users
- **Account Controls** - Activate or deactivate user accounts
- **Content Moderation** - View and delete any post across the platform
- **Analytics Dashboard** - Track key metrics:
  - Total users
  - Total posts
  - Total comments
  - Total likes

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **Next/Image** - Optimized image loading

### Backend
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Cloud storage
  - Real-time subscriptions
- **Row Level Security (RLS)** - Database-level access control
- **Service Role API** - Secure admin operations

---

## 📂 Project Structure

```
social-connect/
├── app/
│   ├── api/
│   │   ├── posts/          # Post CRUD operations
│   │   ├── users/          # User profile management
│   │   ├── admin/          # Admin-only endpoints
│   │   └── notifications/  # Notification handling
│   ├── posts/
│   │   └── [id]/          # Individual post pages
│   ├── admin/
│   │   ├── users/         # User management UI
│   │   ├── posts/         # Post moderation UI
│   │   └── stats/         # Analytics dashboard
│   └── notifications/     # Notification center
├── components/            # Reusable React components
└── lib/
    ├── supabaseServer.ts  # Supabase client config
    └── adminUtil.ts       # Admin utility functions
```

---

## 🗄️ Database Schema

### `profiles`
```sql
- id (uuid, primary key)
- username (text, unique)
- avatar_url (text)
- role (enum: 'user' | 'admin' | 'deactivated')
- created_at (timestamp)
```

### `posts`
```sql
- id (uuid, primary key)
- content (text)
- image_url (text, nullable)
- like_count (integer, default: 0)
- comment_count (integer, default: 0)
- author (uuid, foreign key → profiles.id)
- created_at (timestamp)
```

### `likes`
```sql
- user_id (uuid, foreign key → profiles.id)
- post_id (uuid, foreign key → posts.id)
- created_at (timestamp)
- PRIMARY KEY (user_id, post_id)
```

### `comments`
```sql
- id (uuid, primary key)
- post_id (uuid, foreign key → posts.id)
- user_id (uuid, foreign key → profiles.id)
- content (text)
- created_at (timestamp)
```

### `follows`
```sql
- follower (uuid, foreign key → profiles.id)
- following (uuid, foreign key → profiles.id)
- created_at (timestamp)
- PRIMARY KEY (follower, following)
```

### `notifications`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles.id)
- actor_id (uuid, foreign key → profiles.id)
- type (enum: 'follow' | 'like' | 'comment')
- post_id (uuid, nullable, foreign key → posts.id)
- is_read (boolean, default: false)
- created_at (timestamp)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([sign up here](https://supabase.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-connect.git
   cd social-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up Supabase**
   
   Run the SQL migrations in your Supabase SQL editor to create all necessary tables and RLS policies.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security

### Row Level Security (RLS)

All database tables are protected with RLS policies that ensure:
- Users can only modify their own content
- Users can only view public data or their own private data
- Admin operations require service role authentication

### Service Role Usage

The service role key is used exclusively for:
- Admin dashboard operations
- Creating notifications on behalf of users
- Updating post metadata (like counts, comment counts)

**Never expose the service role key to the client.**

---

## 🔔 Real-Time Features

Social Connect uses Supabase Realtime to provide instant updates:

- **Notifications**: Live notifications appear without page refresh
- **Like Counts**: Post likes update in real-time across all clients
- **New Posts**: Feed updates automatically when followed users post

Real-time listeners are established using Supabase's subscription API:
```javascript
supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    handleNewNotification
  )
  .subscribe()
```

---

## 👨‍💼 Admin Access

### Setting Up an Admin User

1. Create a regular user account through the app
2. Get the user ID from Supabase Dashboard
3. Run this SQL query in Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

### Admin Routes

Once authenticated as admin, access these protected routes:

- `/admin/users` - User management dashboard
- `/admin/posts` - Content moderation panel
- `/admin/stats` - Platform analytics

---

## 🧪 API Routes

### Public Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - New user registration
- `GET /api/posts` - Fetch personalized feed
- `POST /api/posts` - Create a new post

### Protected Endpoints
- `POST /api/posts/:id/like` - Like/unlike a post
- `POST /api/posts/:id/comment` - Add a comment
- `POST /api/users/:id/follow` - Follow/unfollow a user
- `GET /api/notifications` - Fetch user notifications

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id` - Update user status
- `DELETE /api/admin/posts/:id` - Delete any post
- `GET /api/admin/stats` - Fetch platform statistics

---

## 🎨 UI Components

Key reusable components include:

- **PostCard** - Display individual posts with like/comment actions
- **CommentSection** - Threaded comment display and input
- **NotificationBell** - Real-time notification badge and dropdown
- **UserAvatar** - Profile picture with fallback
- **FollowButton** - Toggle follow status with optimistic updates
- **AdminLayout** - Protected layout wrapper for admin pages

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vercel](https://vercel.com) for deployment platform

---

## 📧 Contact

**Project Maintainer** - [@AnirbanSinha27](https://github.com/AnirbanSinha27)

---

<div align="center">
  
### ⭐ If you found this project helpful, please give it a star!

Made with ❤️ and Next.js

</div>
