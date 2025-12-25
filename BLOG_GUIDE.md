# Blog System User Guide

## Overview

The Legal Clinic Uganda blog system provides a modern, clean interface for publishing legal insights, case studies, and updates. It includes both a public-facing blog and a comprehensive admin dashboard.

## Features

### Public Blog
- 📖 Browse all blog posts with filtering by category
- 🔍 View published posts only
- 👁️ Track view counts
- 🏷️ Tag-based navigation
- 📱 Fully responsive design

### Admin Dashboard
- ✍️ Create new blog posts
- ✏️ Edit existing posts
- 🗑️ Delete posts
- 📊 View statistics (total posts, published, drafts, views)
- 📝 Save as draft or publish immediately
- 🔄 Update and republish

## How to Access

### Public Blog
Navigate to: `http://localhost:3001/blog`

### Admin Dashboard
Navigate to: `http://localhost:3001/admin/blog`

## Using the Admin Dashboard

### Creating a New Post

1. Go to `/admin/blog`
2. Click **"+ New Post"** button
3. Fill in the form:
   - **Title** (required): Post headline
   - **Category** (required): E.g., "Legal Advice", "Case Studies"
   - **Tags**: Comma-separated tags (optional)
   - **Featured Image URL**: Link to header image (optional)
   - **Summary**: Brief overview (optional but recommended)
   - **Content** (required): Main post content
4. Choose action:
   - **"Save as Draft"**: Saves without publishing
   - **"Save & Publish"**: Publishes immediately

### Editing a Post

**From Admin Dashboard:**
1. Go to `/admin/blog`
2. Click **"Edit"** next to the post

**From Blog View:**
1. Open any blog post
2. Click **"Edit Post"** at the bottom

### Publishing a Draft

1. Go to `/admin/blog`
2. Find the draft post (orange "Draft" badge)
3. Click **"Publish"** button

### Deleting a Post

1. Go to `/admin/blog`
2. Click **"Delete"** next to the post
3. Click again to confirm

## Blog Post Structure

```javascript
{
  title: string,          // Post headline
  content: string,        // Main content (supports line breaks)
  summary: string,        // Brief overview (optional)
  category: string,       // Post category
  tags: string,           // Comma-separated tags
  imageUrl: string,       // Featured image URL
  authorId: number,       // Author ID (default: 1)
  published: boolean,     // Publication status
  viewCount: number,      // Number of views
  createdAt: timestamp,   // Creation date
  updatedAt: timestamp    // Last update date
}
```

## Admin Dashboard Statistics

The dashboard displays:
- **Total Posts**: All posts (published + drafts)
- **Published**: Currently published posts
- **Drafts**: Unpublished posts
- **Total Views**: Combined view count across all posts

## Navigation

The app includes a top navigation bar:
- **Home**: AI Chat Assistant
- **Blog**: Public blog view
- **Admin**: Blog administration

## API Integration

All blog operations connect to the backend API:
- `POST /api/blog-posts` - Create post
- `GET /api/blog-posts` - Get all posts
- `GET /api/blog-posts/published` - Get published posts
- `GET /api/blog-posts/:id` - Get single post
- `PUT /api/blog-posts/:id` - Update post
- `PATCH /api/blog-posts/:id/publish` - Publish post
- `DELETE /api/blog-posts/:id` - Delete post

## Styling Features

- **Clean, modern design** with gradient headers
- **Card-based layout** for easy scanning
- **Hover effects** for better UX
- **Status badges** (Published/Draft)
- **Category badges** with color coding
- **Responsive grid** that adapts to screen size
- **Mobile-friendly** interface

## Tips for Best Results

1. **Use Clear Titles**: Make titles descriptive and engaging
2. **Add Summaries**: Helps readers decide if they want to read more
3. **Categorize Properly**: Consistent categories help with filtering
4. **Use Featured Images**: Enhances visual appeal
5. **Add Tags**: Improves discoverability
6. **Format Content**: Use line breaks for readability
7. **Save Drafts**: Don't publish until you're ready

## Troubleshooting

### Posts Not Appearing
- Check if backend is running (`./gradlew bootRun`)
- Verify database is accessible
- Check browser console for errors

### Cannot Create Post
- Ensure all required fields are filled
- Check API connection
- Verify backend is running on port 8080

### Styling Issues
- Clear browser cache
- Check that CSS files are loaded
- Verify viewport is set correctly

## Next Steps

To enhance the blog:
1. Add rich text editor (e.g., React Quill)
2. Implement image upload functionality
3. Add author management
4. Include comments system
5. Add search functionality
6. Implement pagination
7. Add post scheduling
8. Include SEO metadata
9. Add social sharing buttons
10. Implement draft auto-save

## Support

For issues or questions:
- Check the backend API logs
- Review browser console
- Verify database connectivity
- Ensure both backend and frontend are running
